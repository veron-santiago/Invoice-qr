import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TablePagination,
  IconButton,
  Button
} from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import dayjs from 'dayjs'
import SearchInput from '../SearchInput'

const BillList = () => {
  const [bills, setBills] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [order, setOrder] = useState('desc')
  const [orderBy, setOrderBy] = useState('billNumber')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    const token = localStorage.getItem('token')

    fetch(`${API_URL}/bills`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener facturas')
        return res.json()
      })
      .then(data => {
        setBills(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoading(false)
      })
  }, [])

  const formatNumber = (number) =>
    number.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })



  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortBills = (array) => {
    const sortedArray = [...array].sort((a, b) => {
      if (orderBy === 'dueDate') {
        const aHasDueDate = a.dueDate !== null;
        const bHasDueDate = b.dueDate !== null;

        if (aHasDueDate !== bHasDueDate) {
          return order === 'asc' ? (aHasDueDate ? 1 : -1) : (aHasDueDate ? -1 : 1);
        }

        return order === 'asc' ? a.billNumber - b.billNumber : b.billNumber - a.billNumber;
      }

      const getValue = (bill) => {
        switch (orderBy) {
          case 'billNumber':
            return bill.billNumber;
          case 'totalAmount':
            return bill.totalAmount;
          case 'customer.name':
            return bill.customerName.toLowerCase();
          // A default case is good practice, though we control orderBy.
          default:
            return bill.billNumber;
        }
      };

      const aVal = getValue(a);
      const bVal = getValue(b);

      if (typeof aVal === 'string') {
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sortedArray;
  };

  const filterBills = (bills) => {
    const normalizedQuery = searchQuery.toLowerCase().replace(/\./g, '')

    return bills.filter((bill) => {
      const issueDate = dayjs(bill.issueDate).format('DD/MM/YYYY')
      const dueDate = dayjs(bill.dueDate).format('DD/MM/YYYY')
      const billNumber = bill.billNumber.toString().padStart(8, '0')
      const customerName = bill.customerName
      const totalAmount = formatNumber(bill.totalAmount).replace(/\./g, '')

      const values = [
        issueDate,
        dueDate,
        billNumber,
        customerName,
        totalAmount
      ]

      return values.some((val) =>
        val.toLowerCase().includes(normalizedQuery)
      )
    })
  }

  const handleDownloadPdf = async (billId) => {
    const token = localStorage.getItem("token");
  const apiRes = await fetch(`${API_URL}/bills/${billId}/pdf`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!apiRes.ok) {
    throw new Error(`Error al pedir URL del PDF: ${apiRes.status}`);
  }

  const url = (await apiRes.text()).trim();

  try {
    const fileRes = await fetch(url, { method: "GET", mode: "cors" });
    if (!fileRes.ok) {
      window.open(url, "_blank");
      return;
    }

    const u = new URL(url);
    const parts = u.pathname.split("/");
    const filename = decodeURIComponent(parts[parts.length - 1]);

    const blob = await fileRes.blob();
    if (!blob || blob.size === 0) {
      window.open(url, "_blank");
      return;
    }

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    window.open(url, "_blank");
  }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Button
          onClick={() => navigate("/bills/create")}
          variant="contained"
          sx={{
            bgcolor: 'var(--color-primary)',
            '&:hover': { bgcolor: 'var(--color-primary-hover)' },
            textTransform: 'none',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <NoteAddIcon />
          Nueva Factura
        </Button>
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </Box>

      {!isLoading && (
        <Box sx={{ 
          bgcolor: 'var(--background-panel)', 
          borderRadius: 3, 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 600, color: 'var(--color-text-primary)', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                    onClick={() => handleRequestSort('issueDate')}
                  >
                    Emisión <ArrowDropDownIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} />
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: 'var(--color-text-primary)', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                    onClick={() => handleRequestSort('dueDate')}
                  >
                    Vencimiento <ArrowDropDownIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} />
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: 'var(--color-text-primary)', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                    onClick={() => handleRequestSort('billNumber')}
                  >
                    Número <ArrowDropDownIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} />
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: 'var(--color-text-primary)', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                    onClick={() => handleRequestSort('customerName')}
                  >
                    Receptor <ArrowDropDownIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} />
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: 'var(--color-text-primary)', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                    onClick={() => handleRequestSort('totalAmount')}
                  >
                    Imp. Total <ArrowDropDownIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Descargar
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortBills(filterBills(bills))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((bill) => {
                    const issueDate = dayjs(bill.issueDate).format('DD/MM/YYYY')
                    const dueDate = bill.dueDate == null ? '-' : dayjs(bill.dueDate).format('DD/MM/YYYY')
                    const billNumber = bill.billNumber.toString().padStart(8, '0')

                    return (
                      <TableRow 
                        key={bill.id}
                        sx={{ 
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                          transition: 'bgcolor 0.2s ease'
                        }}
                      >
                        <TableCell sx={{ color: 'var(--color-text-primary)' }}>{issueDate}</TableCell>
                        <TableCell sx={{ color: 'var(--color-text-primary)' }}>{dueDate}</TableCell>
                        <TableCell sx={{ color: 'var(--color-text-primary)' }}>{billNumber}</TableCell>
                        <TableCell sx={{ color: 'var(--color-text-primary)' }}>{bill.customerName}</TableCell>
                        <TableCell sx={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>${formatNumber(bill.totalAmount)}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => handleDownloadPdf(bill.id)}
                            sx={{
                              color: 'var(--color-primary)',
                              '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.1)' },
                              '&:focus': { outline: 'none' }
                            }}
                          >
                            <PictureAsPdfIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filterBills(bills).length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
            sx={{ borderTop: '1px solid var(--color-border)' }}
          />
        </Box>
      )}

      {isLoading && (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress sx={{ color: 'var(--color-primary)' }} />
        </Box>
      )}
    </Box>
  )
}

export default BillList
