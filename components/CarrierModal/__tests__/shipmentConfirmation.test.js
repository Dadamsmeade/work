import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShippingContext } from '../../../context/shippingContext';
import ShipmentConfirmation from '../shipmentConfirmation.js';

jest.mock('../packageLabel', () => () => (
    <div data-testid="mock-package-label">Mock Package Label</div>
));

describe('ShipmentConfirmation', () => {
    const renderWithContext = shippingState => {
        return render(
            <ShippingContext.Provider value={{ shippingState }}>
                <ShipmentConfirmation />
            </ShippingContext.Provider>,
        );
    };

    const getShippingState = (overrides = {}) => ({
        shipmentConfirmation: {
            output: {
                transactionShipments: [
                    {
                        masterTrackingNumber: '777135302443',
                        serviceName: 'FedEx Ground®',
                        shipDatestamp: '2024-06-30',
                        completedShipmentDetail: {
                            shipmentRating: {
                                shipmentRateDetails: [
                                    {
                                        totalNetCharge: 29.76,
                                        totalNetFedExCharge: 29.76,
                                        surcharges: [
                                            {
                                                description: 'Fuel Surcharge',
                                                amount: 4.1,
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
            combinedPackages: [
                {
                    piece: {
                        packageSequenceNumber: 1,
                        trackingNumber: '777135302443',
                        deliveryDatestamp: '2024-07-05',
                        baseRateAmount: 14.88,
                    },
                    completedDetail: {
                        packageRating: {
                            packageRateDetails: [
                                {
                                    surcharges: [
                                        {
                                            description: 'Package Surcharge',
                                            amount: 2.05,
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
            ],
        },
        selectedCarrier: { Name: 'fedEx' },
        selectedBillingType: 'BILL_SHIPPER',
        ...overrides,
    });

    test('renders nothing when shipmentConfirmation is null', () => {
        const shippingState = {
            shipmentConfirmation: null,
            selectedCarrier: { Name: 'fedEx' },
        };

        renderWithContext(shippingState);

        expect(screen.queryByText('Confirmation')).not.toBeInTheDocument();
    });

    test('renders FedEx shipment confirmation', () => {
        renderWithContext(getShippingState());

        expect(screen.getByText('Confirmation')).toBeInTheDocument();
        expect(screen.getByText('Shipment Details')).toBeInTheDocument();
        expect(screen.getByText('Master Tracking No:')).toBeInTheDocument();
        expect(screen.getAllByText('777135302443')[0]).toBeInTheDocument();
        expect(screen.getAllByText('777135302443')[1]).toBeInTheDocument();
        expect(screen.getByText('Service Type:')).toBeInTheDocument();
        expect(screen.getByText('FedEx Ground®')).toBeInTheDocument();
        expect(screen.getByText('Shipment Date:')).toBeInTheDocument();
        expect(screen.getByText('2024-06-30')).toBeInTheDocument();
        expect(screen.getByText('Total Net FedEx Charge:')).toBeInTheDocument();
        expect(screen.getByText('$29.76')).toBeInTheDocument();
        expect(screen.getByText('Package Details')).toBeInTheDocument();
    });

    test('renders FedEx shipment confirmation with surcharges', () => {
        renderWithContext(getShippingState());

        expect(screen.getByText('Shipment Surcharges')).toBeInTheDocument();
        expect(screen.getByText('Fuel Surcharge:')).toBeInTheDocument();
        expect(screen.getByText('$4.10')).toBeInTheDocument();
    });

    test('renders package details', () => {
        renderWithContext(getShippingState());

        expect(screen.getByText('Package Sequence No:')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('Tracking No:')).toBeInTheDocument();
        expect(screen.getAllByText('777135302443')[0]).toBeInTheDocument();
        expect(screen.getAllByText('777135302443')[1]).toBeInTheDocument();
        expect(screen.getByText('Delivery Date:')).toBeInTheDocument();
        expect(screen.getByText('2024-07-05')).toBeInTheDocument();
        expect(screen.getByText('Base Rate Amount:')).toBeInTheDocument();
        expect(screen.getByText('$14.88')).toBeInTheDocument();
    });

    test('renders package surcharges', () => {
        renderWithContext(getShippingState());

        expect(screen.getByText('Package Surcharges:')).toBeInTheDocument();
        expect(screen.getByText('Package Surcharge:')).toBeInTheDocument();
        expect(screen.getByText('$2.05')).toBeInTheDocument();
    });

    test('does not render billing information when billing type is not BILL_SHIPPER', () => {
        renderWithContext(getShippingState({ selectedBillingType: 'BILL_RECEIVER' }));

        expect(screen.queryByText('Total Net FedEx Charge:')).not.toBeInTheDocument();
        expect(screen.queryByText('Base Rate Amount:')).not.toBeInTheDocument();
    });

    test('renders "Confirmation not available" when transactionShipments is missing', () => {
        const shippingState = {
            shipmentConfirmation: {
                output: {},
            },
            selectedCarrier: { Name: 'fedEx' },
        };

        renderWithContext(shippingState);

        expect(screen.getByText('Confirmation not available')).toBeInTheDocument();
    });

    test('renders UPS shipment confirmation', () => {
        const upsShippingState = {
            shipmentConfirmation: {
                ShipmentResponse: {
                    ShipmentResults: {
                        ShipmentIdentificationNumber: 'UPS123456',
                        BillingWeight: {
                            Weight: '10',
                            UnitOfMeasurement: { Code: 'LBS' },
                        },
                        ShipmentCharges: {
                            TransportationCharges: {
                                MonetaryValue: '20.00',
                                CurrencyCode: 'USD',
                            },
                            ServiceOptionsCharges: {
                                MonetaryValue: '5.00',
                                CurrencyCode: 'USD',
                            },
                            TotalCharges: { MonetaryValue: '25.00', CurrencyCode: 'USD' },
                        },
                        PackageResults: {
                            TrackingNumber: 'UPS987654',
                            ServiceOptionsCharges: {
                                MonetaryValue: '2.00',
                                CurrencyCode: 'USD',
                            },
                        },
                    },
                },
            },
            selectedCarrier: { Name: 'ups' },
            selectedBillingType: 'BILL_SHIPPER',
        };

        renderWithContext(upsShippingState);

        expect(screen.getByText('Confirmation')).toBeInTheDocument();
        expect(screen.getByText('Shipment Details')).toBeInTheDocument();
        expect(screen.getByText('Shipment Identification No:')).toBeInTheDocument();
        expect(screen.getByText('UPS123456')).toBeInTheDocument();
        expect(screen.getByText('Billing Weight:')).toBeInTheDocument();
        expect(screen.getByText('10 LBS')).toBeInTheDocument();
        expect(screen.getByText('Transportation Charges:')).toBeInTheDocument();
        expect(screen.getByText('$20.00 USD')).toBeInTheDocument();
        expect(screen.getByText('Package 1')).toBeInTheDocument();
        expect(screen.getByText('UPS987654')).toBeInTheDocument();
    });
});
