import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ShippingContext } from '../../../context/shippingContext';
import CarrierModal from '../index';
import { BILLING_TYPES } from '../../../constants';
import '@testing-library/jest-dom';

jest.mock('../carrierLayout', () => ({ children }) => <div>{children}</div>);

describe('BillingType component', () => {
    const renderWithContext = shippingState => {
        const { rerender } = render(
            <ShippingContext.Provider
                value={{ shippingState, dispatchShipping: jest.fn() }}
            >
                <CarrierModal isOpen={true} onClose={() => {}} />
            </ShippingContext.Provider>,
        );
        return { rerender };
    };

    it('renders all billing type options', () => {
        const shippingState = {
            modalPage: 1,
            isNextDisabled: true,
        };
        renderWithContext(shippingState);
        expect(screen.getByText('Bill Shipper')).toBeInTheDocument();
        expect(screen.getByText('Bill Receiver')).toBeInTheDocument();
        expect(screen.getByText('Bill Third Party')).toBeInTheDocument();
    });

    it('disables Next button on initial render', async () => {
        const shippingState = {
            modalPage: 1,
            isNextDisabled: true,
        };
        renderWithContext(shippingState);
        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
        });
    });

    it('enables Next button and changes background when billing type is selected', async () => {
        const initialState = {
            modalPage: 1,
            selectedBillingType: null,
            isNextDisabled: true,
            selectedCarrier: { Settings: { colors: { secondary: 'blue' } } },
        };
        const { rerender } = renderWithContext(initialState);

        const updatedState = {
            ...initialState,
            selectedBillingType: BILLING_TYPES.BILL_SHIPPER,
            isNextDisabled: false,
        };

        rerender(
            <ShippingContext.Provider
                value={{ shippingState: updatedState, dispatchShipping: jest.fn() }}
            >
                <CarrierModal isOpen={true} onClose={() => {}} />
            </ShippingContext.Provider>,
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
            expect(
                screen.getByText('Bill Shipper').closest('div').parentElement,
            ).toHaveStyle('background-color: blue');
        });
    });

    it('changes selected billing type', async () => {
        const initialState = {
            modalPage: 1,
            selectedBillingType: BILLING_TYPES.BILL_SHIPPER,
            isNextDisabled: false,
            selectedCarrier: { Settings: { colors: { secondary: 'blue' } } },
        };
        const { rerender } = renderWithContext(initialState);

        const updatedState = {
            ...initialState,
            selectedBillingType: BILLING_TYPES.BILL_RECEIVER,
        };

        rerender(
            <ShippingContext.Provider
                value={{ shippingState: updatedState, dispatchShipping: jest.fn() }}
            >
                <CarrierModal isOpen={true} onClose={() => {}} />
            </ShippingContext.Provider>,
        );

        await waitFor(() => {
            expect(
                screen.getByText('Bill Receiver').closest('div').parentElement,
            ).toHaveStyle('background-color: blue');
            expect(
                screen.getByText('Bill Shipper').closest('div').parentElement,
            ).not.toHaveStyle('background-color: blue');
            expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
        });
    });
});
