import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PlexCustomerContext } from '../../../context/plexCustomerContext';
import { ShippingContext } from '../../../context/shippingContext';
import CarrierModal from '../index';
import * as api from '../../../api/index';
import '@testing-library/jest-dom';
import { mockPlexCustomerState } from '../../../mockData/index.js';

jest.mock('next/router', () => ({
    useRouter: () => ({
        query: { shipperKey: 'mockShipperKey' },
    }),
}));

jest.mock('../../../api/index', () => ({
    getRate: jest.fn(),
}));

jest.mock('../carrierLayout', () => ({ children }) => <div>{children}</div>);
jest.mock('../rateDetails', () => ({ rateQuote }) => (
    <div data-testid="mock-rate-details">{JSON.stringify(rateQuote)}</div>
));
jest.mock('../carrierError', () => ({ error }) => (
    <div data-testid="mock-carrier-error">{JSON.stringify(error)}</div>
));

describe('Rate component', () => {
    const mockShippingState = {
        modalPage: 6,
        selectedAccount: { Account_No: 'mockAccountNo' },
        selectedService: { Integrated_Shipping_Service: 'mockService' },
        selectedCarrier: { Name: 'mockCarrier' },
        formData: {
            Ship_From: 'mockShipFrom',
            Customer_Name: 'mockCustomerName',
            Customer_Address: 'mockAddress',
            City: 'mockCity',
            State: 'mockState',
            Zip: 'mockZip',
            Phone: 'mockPhone',
        },
        packages: { data: ['mockPackage1', 'mockPackage2'] },
        selectedBillingType: 'BILL_SHIPPER',
        isNextDisabled: true,
    };

    const renderWithContext = (shippingState = mockShippingState) => {
        const { rerender } = render(
            <PlexCustomerContext.Provider
                value={{ plexCustomerState: mockPlexCustomerState }}
            >
                <ShippingContext.Provider
                    value={{ shippingState, dispatchShipping: jest.fn() }}
                >
                    <CarrierModal isOpen={true} onClose={() => {}} />
                </ShippingContext.Provider>
            </PlexCustomerContext.Provider>,
        );
        return { rerender };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches rate on successful API call', async () => {
        const mockRateQuote = { rate: 10.99 };
        api.getRate.mockResolvedValue({ data: mockRateQuote });

        const { rerender } = renderWithContext();

        await waitFor(() => {
            expect(screen.getByTestId('mock-rate-details')).toBeInTheDocument();
        });

        const updatedState = {
            ...mockShippingState,
            rateQuote: mockRateQuote,
            isNextDisabled: false,
        };

        rerender(
            <PlexCustomerContext.Provider
                value={{ plexCustomerState: mockPlexCustomerState }}
            >
                <ShippingContext.Provider
                    value={{ shippingState: updatedState, dispatchShipping: jest.fn() }}
                >
                    <CarrierModal isOpen={true} onClose={() => {}} />
                </ShippingContext.Provider>
            </PlexCustomerContext.Provider>,
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
        });
    });

    it('displays error message on API call failure', async () => {
        const mockError = { message: 'API Error' };
        api.getRate.mockRejectedValue({ response: { data: { errors: mockError } } });

        renderWithContext();

        await waitFor(() => {
            expect(screen.getByTestId('mock-carrier-error')).toBeInTheDocument();
            expect(screen.getByTestId('mock-carrier-error')).toHaveTextContent(
                JSON.stringify({ details: mockError }),
            );
        });
    });

    it('does not fetch rate if rateQuote is already present in state', async () => {
        const existingRateQuote = { rate: 15.99 };
        const initialState = {
            ...mockShippingState,
            rateQuote: existingRateQuote,
            isNextDisabled: false,
        };

        renderWithContext(initialState);

        await waitFor(() => {
            expect(screen.getByTestId('mock-rate-details')).toBeInTheDocument();
            expect(screen.getByTestId('mock-rate-details')).toHaveTextContent(
                JSON.stringify(existingRateQuote),
            );
            expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
        });

        expect(api.getRate).not.toHaveBeenCalled();
    });
});
