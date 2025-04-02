import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShippingContext } from '../../../context/shippingContext';
import ConfirmShipment from '../confirmShipment.js';

describe('ConfirmShipment', () => {
    const renderWithContext = shippingState => {
        return render(
            <ShippingContext.Provider value={{ shippingState }}>
                <ConfirmShipment />
            </ShippingContext.Provider>,
        );
    };

    test('renders shipment details', () => {
        const shippingState = {
            formData: {
                Customer_Address: '2801 Newtown Blvd',
                City: 'Sarasota',
                State: 'FL',
                Zip: '34234',
                Country: 'USA',
            },
            selectedAccount: {
                Integrated_Shipping_Account: 'Test Account',
            },
            selectedBillTo: {
                Integrated_Shipping_Bill_To: 'Test Bill To',
            },
            selectedService: {
                Integrated_Shipping_Service: 'Test Service',
            },
            rateQuote: {},
        };

        renderWithContext(shippingState);

        expect(screen.getByText('Service:')).toBeInTheDocument();
        expect(screen.getByText('Test Service')).toBeInTheDocument();
        expect(screen.getByText('Bill From:')).toBeInTheDocument();
        expect(screen.getByText('Test Account')).toBeInTheDocument();
        expect(screen.getByText('Bill To:')).toBeInTheDocument();
        expect(screen.getByText('Test Bill To')).toBeInTheDocument();
        expect(screen.getByText('Ship To:')).toBeInTheDocument();
        expect(screen.getByText('2801 Newtown Blvd')).toBeInTheDocument();
        expect(screen.getByText('Sarasota, FL 34234 USA')).toBeInTheDocument();
    });

    test('renders FedEx rate quote details', () => {
        const shippingState = {
            formData: {},
            selectedAccount: {},
            selectedBillTo: {},
            selectedService: {},
            rateQuote: {
                output: {
                    rateReplyDetails: [
                        {
                            ratedShipmentDetails: [
                                {
                                    totalNetCharge: 10.5,
                                    totalNetFedExCharge: 10.5,
                                },
                            ],
                        },
                    ],
                },
            },
        };

        renderWithContext(shippingState);

        expect(screen.getByText('Estimated Total:')).toBeInTheDocument();
        expect(screen.getByText('$10.50')).toBeInTheDocument(); // todo, jupdate for trailing zeroes so this test fails
    });

    test('renders UPS rate quote details', () => {
        const shippingState = {
            formData: {},
            selectedAccount: {},
            selectedBillTo: {},
            selectedService: {},
            rateQuote: {
                RateResponse: {
                    RatedShipment: {
                        TotalCharges: {
                            MonetaryValue: 12.5,
                        },
                        BillingWeight: {
                            Weight: 5,
                            UnitOfMeasurement: {
                                Description: 'LBS',
                            },
                        },
                    },
                },
            },
        };

        renderWithContext(shippingState);

        expect(screen.getByText('Estimated Total:')).toBeInTheDocument();
        expect(screen.getByText('$12.50')).toBeInTheDocument(); // todo, jupdate for trailing zeroes so this test fails
        expect(screen.getByText('Billing Weight:')).toBeInTheDocument();
        expect(screen.getByText('5 LBS')).toBeInTheDocument();
    });
});
