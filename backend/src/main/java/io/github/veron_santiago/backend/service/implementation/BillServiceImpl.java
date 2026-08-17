package io.github.veron_santiago.backend.service.implementation;

import io.github.veron_santiago.backend.persistence.entity.*;
import io.github.veron_santiago.backend.persistence.repository.IBillRepository;
import io.github.veron_santiago.backend.persistence.repository.ICompanyRepository;
import io.github.veron_santiago.backend.persistence.repository.ICustomerRepository;
import io.github.veron_santiago.backend.persistence.repository.IProductRepository;
import io.github.veron_santiago.backend.presentation.dto.request.BillLineRequest;
import io.github.veron_santiago.backend.presentation.dto.request.BillRequest;
import io.github.veron_santiago.backend.presentation.dto.request.CustomerRequest;
import io.github.veron_santiago.backend.presentation.dto.response.BillDTO;
import io.github.veron_santiago.backend.presentation.dto.response.CustomerDTO;
import io.github.veron_santiago.backend.service.exception.*;
import io.github.veron_santiago.backend.service.interfaces.*;
import io.github.veron_santiago.backend.util.AuthUtil;
import io.github.veron_santiago.backend.util.mapper.BillMapper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.access.AccessDeniedException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
public class BillServiceImpl implements IBillService {

    private final IBillRepository billRepository;
    private final ICompanyRepository companyRepository;
    private final BillMapper billMapper;
    private final AuthUtil authUtil;
    private final ICustomerService customerService;
    private final ICustomerRepository customerRepository;
    private final IBillLineService billLineService;
    private final IPdfService pdfService;
    private final JavaMailSender javaMailSender;
    private final IProductRepository productRepository;
    private final IMercadoPagoService mercadoPagoService;
    private final QrCodeService qrCodeService;

    public BillServiceImpl(IBillRepository billRepository, ICompanyRepository companyRepository, BillMapper billMapper, AuthUtil authUtil, ICustomerService customerService, ICustomerRepository customerRepository, IBillLineService billLineService, IPdfService pdfService, JavaMailSender javaMailSender, IProductRepository productRepository, IMercadoPagoService mercadoPagoService, QrCodeService qrCodeService) {
        this.billRepository = billRepository;
        this.companyRepository = companyRepository;
        this.billMapper = billMapper;
        this.authUtil = authUtil;
        this.customerService = customerService;
        this.customerRepository = customerRepository;
        this.billLineService = billLineService;
        this.pdfService = pdfService;
        this.javaMailSender = javaMailSender;
        this.productRepository = productRepository;
        this.mercadoPagoService = mercadoPagoService;
        this.qrCodeService = qrCodeService;
    }


    @Override
    public BillDTO createBill(BillRequest billRequest, HttpServletRequest request) throws IOException {

        Company company = getCompany(request);

        verifyNoDuplicateCode(billRequest);
        verifyNoDuplicateProduct(billRequest);
        verifyCodeBelongsToProduct(billRequest, company.getId());

        AtomicReference<BigDecimal> total = calculateTotal(billRequest);
        Customer customer = getOrCreateCustomer(company, billRequest, request);
        Bill bill = buildBill(billRequest, company, customer, total);
        Bill saved = billRepository.save(bill);

        List<BillLine> billLines = createBillLines(billRequest, saved, request);
        saved.setBillLines(new ArrayList<>(billLines));

        byte[] qrBytes = generateQrBytes(billRequest, company, total);
        String path = pdfService.generateBillPdf(saved, request, billRequest.includeQr(), qrBytes);
        saved.setPdfPath(path);
        Bill finalSaved = billRepository.save(saved);

        if (billRequest.sendEmail()) sendPdfToEmail(request, finalSaved.getCustomerEmail(), bill, company);

        return billMapper.billToBillDTO(finalSaved, new BillDTO());
    }

    @Override
    public BillDTO getBillById(Long id, HttpServletRequest request){
        Long companyId = authUtil.getAuthenticatedCompanyId(request);
        Bill bill = billRepository.findById(id)
                .orElseThrow( () -> new ObjectNotFoundException(ErrorMessages.BILL_NOT_FOUND.getMessage()));
        if(!bill.getCompany().getId().equals(companyId)) throw new AccessDeniedException(ErrorMessages.ACCESS_DENIED_READ.getMessage());
        return billMapper.billToBillDTO(bill, new BillDTO());
    }

    @Override
    public List<BillDTO> getAllBills(HttpServletRequest request) {
        Long companyId = authUtil.getAuthenticatedCompanyId(request);
        List<Bill> bills = billRepository.findByCompanyId(companyId);
        return bills.stream()
                .map( bill -> billMapper.billToBillDTO(bill, new BillDTO()) )
                .collect(Collectors.toList());
    }

    private Company getCompany(HttpServletRequest request){
        Long companyId = authUtil.getAuthenticatedCompanyId(request);
        return companyRepository.findById(companyId)
                .orElseThrow( () -> new ObjectNotFoundException(ErrorMessages.COMPANY_NOT_FOUND.getMessage()));
    }
    private void verifyNoDuplicateProduct(BillRequest billRequest){
        Set<String> names = new HashSet<>();
        for (BillLineRequest line : billRequest.billLineRequests()) {
            String name = line.name().toLowerCase();
            if (!names.add(name)) {
                throw new InvalidFieldException(ErrorMessages.DUPLICATE_PRODUCT_IN_BILL.getMessage());
            }
        }
    }
    private void verifyNoDuplicateCode(BillRequest billRequest){
        Set<String> codes = new HashSet<>();
        for (BillLineRequest line : billRequest.billLineRequests()) {
            String code = line.code();
            if (code != null && !codes.add(code.toLowerCase())){
                throw new InvalidFieldException(ErrorMessages.DUPLICATE_CODE_IN_BILL.getMessage());
            }
        }
    }
    private void verifyCodeBelongsToProduct(BillRequest billRequest, Long companyId){
        for (BillLineRequest line : billRequest.billLineRequests()) {
            String name = line.name().toLowerCase();
            String code = line.code();
            Product product = null;
            if (code != null && !code.isEmpty()) {
                product = productRepository.findByCodeAndCompanyId(code, companyId).orElse(null);
            }
            if (code != null && product != null && !product.getName().equalsIgnoreCase(name)){
                throw new ResourceConflictException("El código " + code + " ya está en uso.\nAsignado a: " + product.getName());
            }
        }
    }
    private void sendPdfToEmail(HttpServletRequest request, String email, Bill bill, Company company) throws java.nio.file.AccessDeniedException {
        if (email == null || email.isEmpty()) return;

        String pdfUrl = pdfService.getPdfByBillId(bill.getId(), request);

        byte[] pdf;
        String filename;
        try {
            URI uri = new URI(pdfUrl);
            try (InputStream in = uri.toURL().openStream()) {
                pdf = in.readAllBytes();
            }
            String p = uri.getPath();
            filename = java.net.URLDecoder.decode(p.substring(p.lastIndexOf('/') + 1), java.nio.charset.StandardCharsets.UTF_8);
        } catch (URISyntaxException | IOException e) {
            throw new InternalServerException("Error al enviar el PDF");
        }

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(email);
            helper.setSubject("Factura de " + company.getCompanyName());
            helper.setText("PDF: ");
            ByteArrayResource resource = new ByteArrayResource(pdf);
            helper.addAttachment(filename, resource);
            javaMailSender.send(message);
        } catch (MessagingException | MailException e) {
            throw new InternalServerException("Error al enviar el PDF");
        }
    }
    private AtomicReference<BigDecimal> calculateTotal(BillRequest billRequest){
        AtomicReference<BigDecimal> total = new AtomicReference<>(BigDecimal.ZERO);
        billRequest.billLineRequests()
                .forEach(req -> {
                    BigDecimal lineTotal = req.price().multiply(BigDecimal.valueOf(req.quantity()));
                    total.updateAndGet(t -> t.add(lineTotal));
                });
        return total;
    }
    private Customer getOrCreateCustomer(Company company, BillRequest billRequest, HttpServletRequest request){
        return customerRepository.findByCompanyIdAndNameIgnoreCase(company.getId(), billRequest.customerName())
                .orElseGet(() -> {
                    CustomerRequest cReq = new CustomerRequest(
                            billRequest.customerName(),
                            billRequest.customerAddress(),
                            billRequest.customerEmail()
                    );
                    CustomerDTO savedDto = customerService.createCustomer(cReq, request);
                    return customerRepository.findById(savedDto.getId())
                            .orElseThrow(() -> new ObjectNotFoundException(ErrorMessages.CUSTOMER_NOT_FOUND.getMessage()));
                });
    }
    private List<BillLine> createBillLines(BillRequest billRequest, Bill bill, HttpServletRequest request){
        return billRequest.billLineRequests()
                .stream()
                .map( billLineRequest -> {
                    try {
                        return billLineService.createBillLine(billLineRequest, bill, request);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                })
                .toList();
    }
    private byte[] generateQrBytes(BillRequest billRequest, Company company, AtomicReference<BigDecimal> total){
        if (billRequest.includeQr()){
            String paymentLink = mercadoPagoService.createPaymentLink(company, total.get());
            return qrCodeService.generateQrCode(paymentLink, 200, 200);
        }
        return null;
    }
    private Bill buildBill(BillRequest billRequest, Company company, Customer customer, AtomicReference<BigDecimal> total){
        return Bill.builder()
                .billNumber((long) (company.getBills().size() + 1))
                .issueDate(LocalDate.now())
                .dueDate( billRequest.includeQr() ? LocalDate.now().plusDays(30) : null)
                .totalAmount(total.get())
                .companyName(company.getCompanyName())
                .companyEmail(company.getEmail())
                .companyAddress(company.getAddress())
                .customerName(billRequest.customerName())
                .customerEmail(billRequest.customerEmail())
                .customerAddress(billRequest.customerAddress())
                .company(company)
                .customer(customer)
                .build();
    }
}
