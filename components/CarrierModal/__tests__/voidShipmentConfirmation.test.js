import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShippingContext } from '../../../context/shippingContext';
import VoidShipmentConfirmation from '../voidShipmentConfirmation.js';

describe('VoidShipmentConfirmation', () => {
    const renderWithContext = shippingState => {
        return render(
            <ShippingContext.Provider value={{ shippingState }}>
                <VoidShipmentConfirmation />
            </ShippingContext.Provider>,
        );
    };

    test('renders nothing when voidShipmentConfirmation is not available', () => {
        const shippingState = {
            voidShipmentConfirmation: null,
            selectedCarrier: { Name: 'fedEx' },
        };
        renderWithContext(shippingState);
        expect(screen.queryByText('Void Shipment Confirmation')).not.toBeInTheDocument();
    });

    test('renders FedEx void shipment confirmation', () => {
        const shippingState = {
            voidShipmentConfirmation: {
                transactionId: '123',
                output: {
                    cancelledShipment: true,
                    cancelledHistory: false,
                    alerts: [
                        {
                            code: 'test_code',
                            message: 'test_message',
                            alertType: 'test_type',
                        },
                    ],
                },
            },
            selectedCarrier: { Name: 'fedEx' },
        };
        renderWithContext(shippingState);
        expect(screen.getByText('Void Shipment Confirmation')).toBeInTheDocument();
        expect(screen.getByText('Transaction ID: 123')).toBeInTheDocument();
        expect(screen.getByText('Cancelled Shipment:')).toBeInTheDocument();
        expect(screen.getByText('Yes')).toBeInTheDocument();
        expect(screen.getByText('Cancelled History:')).toBeInTheDocument();
        expect(screen.getByText('No')).toBeInTheDocument();
        expect(screen.getByText('Alerts')).toBeInTheDocument();
        expect(
            screen.getByText('Code: test_code, Message: test_message, Type: test_type'),
        ).toBeInTheDocument();
    });

    test('renders UPS void shipment confirmation', () => {
        const shippingState = {
            voidShipmentConfirmation: {
                VoidShipmentResponse: {
                    Response: {
                        ResponseStatus: {
                            Code: '1',
                            Description: 'Success',
                        },
                    },
                    SummaryResult: {
                        Status: {
                            Code: '1',
                            Description: 'Voided',
                        },
                    },
                },
            },
            selectedCarrier: { Name: 'ups' },
        };
        renderWithContext(shippingState);
        expect(screen.getByText('Void Shipment Confirmation')).toBeInTheDocument();
        expect(screen.getByText('Response Code:')).toBeInTheDocument();
        expect(screen.getAllByText('1')[0]).toBeInTheDocument();
        expect(screen.getByText('Response Description:')).toBeInTheDocument();
        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText('Status Code:')).toBeInTheDocument();
        expect(screen.getAllByText('1')[0]).toBeInTheDocument();
        expect(screen.getByText('Status Description:')).toBeInTheDocument();
        expect(screen.getByText('Voided')).toBeInTheDocument();
    });
});
