import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlexCustomerContext } from '../../../context/plexCustomerContext';
import { ShippingContext } from '../../../context/shippingContext';
import CarrierModal from '../index';
import * as api from '../../../api/index';
import '@testing-library/jest-dom';
import { mockPlexCustomerState } from '../../../mockData/index.js';

jest.mock('next/router', () => ({
    useRouter: () => ({
        query: { shipperKey: '8428808' },
    }),
}));

jest.mock('../../../api/index', () => ({
    updateIntegratedShippingCustomerAddress: jest.fn(),
    validateAddress: jest.fn(),
}));

jest.mock('../carrierLayout', () => ({ children }) => <div>{children}</div>);

jest.mock('../validatedAddress', () => {
    return function MockValidatedAddress({ validatedAddress }) {
        return <div>5877 JOHN R RD</div>;
    };
});

describe('Address component', () => {
    const mockShippingState = {
        modalPage: 5,
        validatedAddress: null,
        selectedCarrier: { Name: 'UPS' },
        formData: {
            Customer_Name: '123',
            Customer_Address: '5877 John R Road',
            City: 'Troy',
            State: 'MI',
            Zip: '48085',
            Country: 'USA',
        },
        residential: false,
        isNextDisabled: true,
    };

    const mockValidatedAddress = {
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
    };

    const renderWithContext = (shippingState = mockShippingState) => {
        return render(
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
    };

    beforeEach(() => {
        api.updateIntegratedShippingCustomerAddress.mockReset();
        api.validateAddress.mockReset();
    });

    it('renders the address details correctly', () => {
        renderWithContext();

        expect(screen.getByText('5877 John R Road')).toBeInTheDocument();
        expect(screen.getByText('Troy, MI 48085')).toBeInTheDocument();
        expect(screen.getByText('USA')).toBeInTheDocument();
    });

    it('validates the address and displays the result', async () => {
        api.validateAddress.mockResolvedValue({ data: mockValidatedAddress });
        renderWithContext();

        fireEvent.click(screen.getByText('Validate'));

        await waitFor(() => {
            expect(screen.getByText('Validated Address:')).toBeInTheDocument();
            expect(screen.getByText('5877 JOHN R RD')).toBeInTheDocument();
        });
    });

    it('updates the address', async () => {
        api.validateAddress.mockResolvedValue({ data: mockValidatedAddress });
        api.updateIntegratedShippingCustomerAddress.mockResolvedValue({
            data: { status: 200 },
        });

        renderWithContext();

        fireEvent.click(screen.getByText('Validate'));

        await waitFor(() => {
            expect(screen.getByText('Accept')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Accept'));

        await waitFor(() => {
            expect(screen.getByText('Address Updated')).toBeInTheDocument();
        });
    });

    it('cancels the address validation', async () => {
        api.validateAddress.mockResolvedValue({ data: mockValidatedAddress });

        renderWithContext();

        fireEvent.click(screen.getByText('Validate'));

        await waitFor(() => {
            expect(screen.getByText('Cancel')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Cancel'));

        await waitFor(() => {
            expect(screen.getByText('Address validation canceled.')).toBeInTheDocument();
        });
    });

    it('handles validation error', async () => {
        const errorMessage = 'Failed to validate address.';
        api.validateAddress.mockRejectedValue(new Error(errorMessage));

        renderWithContext();

        fireEvent.click(screen.getByText('Validate'));

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    it('handles update error', async () => {
        api.validateAddress.mockResolvedValue({ data: mockValidatedAddress });
        api.updateIntegratedShippingCustomerAddress.mockRejectedValue(
            new Error('Update failed'),
        );

        renderWithContext();

        fireEvent.click(screen.getByText('Validate'));

        await waitFor(() => {
            expect(screen.getByText('Accept')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Accept'));

        await waitFor(() => {
            expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
        });
    });
});
