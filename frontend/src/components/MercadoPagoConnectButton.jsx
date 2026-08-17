import React from 'react';
import { Button } from '@mui/material';
import { getMercadoPagoConnection } from '../services/companyService';

const MercadoPagoConnectButton = ({
    onConnectionSuccess,
    buttonText = 'Vincular con Mercado Pago'
}) => {
    const handleConnect = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const popup = window.open(
            '',
            'MercadoPagoAuth',
            'width=600,height=700'
        );

        if (!popup) {
            console.error('No se pudo abrir la ventana de Mercado Pago.');
            return;
        }

        try {
            const url = await getMercadoPagoConnection(token);

            popup.location.href = url;

            const timer = setInterval(() => {
                if (popup.closed) {
                    clearInterval(timer);

                    if (onConnectionSuccess) {
                        onConnectionSuccess();
                    }
                }
            }, 500);
        } catch (error) {
            console.error('Error connecting to Mercado Pago:', error);

            popup.close();
        }
    };

    return (
        <Button variant="contained" onClick={handleConnect}>
            {buttonText}
        </Button>
    );
};

export default MercadoPagoConnectButton;