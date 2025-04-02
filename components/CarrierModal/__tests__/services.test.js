import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PlexCustomerContext } from '../../../context/plexCustomerContext';
import { ShippingContext } from '../../../context/shippingContext';
import CarrierModal from '../index';
import * as api from '../../../api/index';
import '@testing-library/jest-dom';
import { mockPlexCustomerState } from '../../../mockData/index.js';

jest.mock('../../../api/index', () => ({
    getIntegratedShippingServices: jest.fn(),
}));

jest.mock('../carrierLayout', () => ({ children }) => <div>{children}</div>);

jest.mock('../../DataTable/dataTable', () => {
    return function MockDataTable({ data }) {
        return (
            <div data-testid="mock-data-table">
                {data?.map((item, index) => (
                    <div key={index}>{item.Integrated_Shipping_Service}</div>
                ))}
            </div>
        );
    };
});

describe('Services component', () => {
    const mockServices = {
        columns: ['Carrier_Code', 'Integrated_Shipping_Service'],
        data: [
            {
                Carrier_Code: 'UPS',
                Integrated_Shipping_Service: 'UPS Ground',
                Carrier_No: '1',
                Integrated_Shipping_Service_Key: '123',
            },
            {
                Carrier_Code: 'FedEx',
                Integrated_Shipping_Service: 'FedEx Express',
                Carrier_No: '2',
                Integrated_Shipping_Service_Key: '456',
            },
        ],
    };

    const mockShippingState = {
        modalPage: 3,
        selectedCarrier: { Integrated_Shipping_Provider_Type_Key: '1' },
        services: mockServices,
        selectedService: null,
        isNextDisabled: true,
    };

    beforeEach(() => {
        api.getIntegratedShippingServices.mockReset();
        api.getIntegratedShippingServices.mockResolvedValue({ data: mockServices }); // prevent errors thrown from null res
    });

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

    it('renders the services component correctly', async () => {
        renderWithContext();

        await waitFor(() => {
            expect(screen.getByText('Select Service')).toBeInTheDocument();
            expect(screen.getByText('UPS Ground')).toBeInTheDocument();
            expect(screen.getByText('FedEx Express')).toBeInTheDocument();
        });
    });

    it('selects a service and enables Next button', async () => {
        const { rerender } = renderWithContext();

        await waitFor(() => {
            expect(screen.getByText('UPS Ground')).toBeInTheDocument();
        });

        const updatedState = {
            ...mockShippingState,
            selectedService: mockServices.data[0],
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

    it('shows Saturday Delivery checkbox for eligible services', async () => {
        const saturdayEligibleService = {
            ...mockServices.data[0],
            Integrated_Shipping_Service_Code: 'FIRSTOVERNIGHT',
        };

        const initialState = {
            ...mockShippingState,
            services: { ...mockServices, data: [saturdayEligibleService] },
        };

        const { rerender } = renderWithContext(initialState);

        await waitFor(() => {
            expect(screen.getByText('UPS Ground')).toBeInTheDocument();
        });

        const updatedState = {
            ...initialState,
            selectedService: saturdayEligibleService,
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
            expect(screen.getByText('Saturday Delivery')).toBeInTheDocument();
        });
    });

    it('does not show Saturday Delivery checkbox for non-eligible services', async () => {
        const nonSaturdayEligibleService = {
            ...mockServices.data[0],
            Integrated_Shipping_Service_Code: 'STANDARD',
        };

        const initialState = {
            ...mockShippingState,
            services: { ...mockServices, data: [nonSaturdayEligibleService] },
            selectedService: nonSaturdayEligibleService,
        };

        renderWithContext(initialState);

        await waitFor(() => {
            expect(screen.queryByText('Saturday Delivery')).not.toBeInTheDocument();
        });
    });
});
