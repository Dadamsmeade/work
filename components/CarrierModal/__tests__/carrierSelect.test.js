import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PlexCustomerContext } from '../../../context/plexCustomerContext';
import { ShippingContext } from '../../../context/shippingContext';
import CarrierModal from '../index';
import * as api from '../../../api/index';
import '@testing-library/jest-dom';
import { mockPlexCustomerState } from '../../../mockData/index.js';

jest.mock('../../../api/index', () => ({
    getEnabledCarriers: jest.fn(),
}));

jest.mock('../carrierLayout', () => ({ children }) => <div>{children}</div>);

describe('CarrierSelect', () => {
    const enabledCarriers = [
        {
            Label: 'FedEx',
            Settings: { colors: { secondary: '#ff0000', hover: '#cc0000' } },
        },
        {
            Label: 'UPS',
            Settings: { colors: { secondary: '#ffcc00', hover: '#ffaa00' } },
        },
    ];

    beforeEach(() => {
        api.getEnabledCarriers.mockReset();
        api.getEnabledCarriers.mockResolvedValue({ data: enabledCarriers });
    });

    const renderWithContext = shippingState => {
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

    it('renders the carrier selection correctly', async () => {
        const shippingState = {
            modalPage: 0,
            enabledCarriers,
            isNextDisabled: true,
        };

        renderWithContext(shippingState);

        await waitFor(() => {
            expect(screen.getByText('FedEx')).toBeInTheDocument();
            expect(screen.getByText('UPS')).toBeInTheDocument();
        });
    });

    it('selects a carrier, changes background color and enables Next button', async () => {
        const initialState = {
            modalPage: 0,
            enabledCarriers,
            selectedCarrier: null,
            isNextDisabled: true,
        };

        const { rerender } = renderWithContext(initialState);

        const updatedState = {
            ...initialState,
            selectedCarrier: enabledCarriers[0],
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
            expect(screen.getByText('FedEx').closest('div').parentElement).toHaveStyle(
                'background-color: #ff0000',
            );
            expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
        });
    });

    it('changes selected carrier', async () => {
        const initialState = {
            modalPage: 0,
            enabledCarriers,
            selectedCarrier: enabledCarriers[0],
            isNextDisabled: false,
        };

        const { rerender } = renderWithContext(initialState);

        const updatedState = {
            ...initialState,
            selectedCarrier: enabledCarriers[1],
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
            expect(
                screen.getAllByText('UPS')[1].closest('div').parentElement,
            ).toHaveStyle('background-color: #ffcc00');
            expect(
                screen.getByText('FedEx').closest('div').parentElement,
            ).not.toHaveStyle('background-color: #ff0000');
            expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
        });
    });
});
