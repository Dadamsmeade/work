import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlexCustomerContext } from '../../../context/plexCustomerContext';
import { ShippingContext } from '../../../context/shippingContext';
import { ShippersContext } from '../../../context/shippersContext';
import CarrierModal from '../index';
import * as api from '../../../api/index';
import { mockPlexCustomerState, mockImageTypes } from '../../../mockData/index.js';

jest.mock('../../../api/index');
jest.mock('next/router', () => ({
    useRouter: () => ({
        query: { shipperKey: 'testShipperKey' },
    }),
}));

jest.mock('../carrierLayout', () => ({ children }) => <div>{children}</div>);
jest.mock('../labelSelect', () => () => (
    <div data-testid="mock-label-select">LabelSelect</div>
));
jest.mock('../confirmShipment', () => () => (
    <div data-testid="mock-confirm-shipment">ConfirmShipment</div>
));
jest.mock('../shippingLabel', () => () => (
    <div data-testid="mock-shipping-label">ShippingLabel</div>
));

describe('Shipment', () => {
    const mockShippersState = {
        selectedShipper: {
            Shipper_Key: '1234',
            Shipper_ID: 'ABC123',
            Shipper_Name: 'Test Shipper',
            Ship_From: '123 Main St, Anytown, USA',
            ShipFromIdentifier: 'SFI001',
            Shipper_Phone: '123-456-7890',
            Shipper_Email: 'test@example.com',
            Shipper_Active: 'Y',
            Shipper_Residential: 'N',
        },
    };

    const mockShippingState = {
        modalPage: 7, // last page, change if new modal page is added
        validatedAddress: {
            XAVResponse: {
                Candidate: {
                    AddressKeyFormat: {
                        AddressLine: '5877 JOHN R RD',
                        CountryCode: 'US',
                        PoliticalDivision1: 'MI',
                        PoliticalDivision2: 'TROY',
                        PostcodeExtendedLow: '3863',
                        PostcodePrimaryLow: '48085',
                        Region: 'TROY MI 48085-3863',
                    },
                },
                Response: {
                    ResponseStatus: {
                        Code: '1',
                        Description: 'Success',
                    },
                },
                ValidAddressIndicator: 'VALID',
            },
        },
        selectedCarrier: { Name: 'UPS', Integrated_Shipping_Provider_Type_Key: 1 },
        formData: {
            Customer_Name: 'Cumulus',
            Customer_Address: '5877 John R Road',
            City: 'Troy',
            State: 'MI',
            Zip: '48085',
            Country: 'USA',
        },
        residential: false,
        selectedAccount: {
            Integrated_Shipping_Account: 'Test Account',
            Account_No: 'ACC123',
        },
        selectedBillTo: {
            Integrated_Shipping_Bill_To: 'Test Bill To',
            Account_No: 'BILL123',
        },
        selectedService: {
            Integrated_Shipping_Service: 'UPS Ground',
            Integrated_Shipping_Service_Key: 'SVC123',
        },
        rateQuote: {},
        selectedImageType: null,
        selectedStockType: null,
        packages: { data: [] },
        containers: { data: [] },
        shipmentConfirmation: null,
        fetchingShipment: false,
        voidingShipment: false,
        selectedBillingType: 'BILL_SHIPPER',
        isSaturdayDelivery: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderWithContexts = (
        shippingState = mockShippingState,
        shippersState = mockShippersState,
    ) => {
        return render(
            <PlexCustomerContext.Provider
                value={{ plexCustomerState: mockPlexCustomerState }}
            >
                <ShippingContext.Provider
                    value={{ shippingState, dispatchShipping: jest.fn() }}
                >
                    <ShippersContext.Provider value={{ shippersState }}>
                        <CarrierModal isOpen={true} onClose={() => {}} />
                    </ShippersContext.Provider>
                </ShippingContext.Provider>
            </PlexCustomerContext.Provider>,
        );
    };

    it('renders Confirm Shipment section', () => {
        renderWithContexts();
        expect(screen.getByText('Confirm Shipment')).toBeInTheDocument();
        expect(screen.getByTestId('mock-confirm-shipment')).toBeInTheDocument();
    });

    it('renders Create Shipment button', () => {
        renderWithContexts();
        expect(
            screen.getByRole('button', { name: 'Create Shipment' }),
        ).toBeInTheDocument();
    });

    it('renders error message when Create Shipment fails', async () => {
        const errorMessage = 'An unknown error occurred';
        api.syncShipment.mockRejectedValueOnce(new Error(errorMessage));

        renderWithContexts();

        const createShipmentButton = screen.getByRole('button', {
            name: 'Create Shipment',
        });
        expect(createShipmentButton).toBeInTheDocument();
        createShipmentButton.click();

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    it('disables Create Shipment button when fetching shipment', () => {
        const fetchingState = {
            ...mockShippingState,
            fetchingShipment: true,
        };
        renderWithContexts(fetchingState);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders Void button when shipment confirmation exists', () => {
        const confirmedState = {
            ...mockShippingState,
            shipmentConfirmation: { someData: 'exists' },
        };
        renderWithContexts(confirmedState);

        expect(screen.getByRole('button', { name: 'Void' })).toBeInTheDocument();
    });

    it('renders mocked child components', () => {
        renderWithContexts();

        expect(screen.getByTestId('mock-label-select')).toBeInTheDocument();
        expect(screen.getByTestId('mock-confirm-shipment')).toBeInTheDocument();
        expect(screen.getByTestId('mock-shipping-label')).toBeInTheDocument();
    });
});
