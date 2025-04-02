import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ShippingContext } from '../../../context/shippingContext';
import CarrierModal from '../index';
import '@testing-library/jest-dom';

jest.mock('../accounts', () => () => <div data-testid="mock-accounts">Accounts</div>);
jest.mock('../billTos', () => () => <div data-testid="mock-billTos">BillTos</div>);

describe('Billing component', () => {
    const renderWithContext = shippingState => {
        return render(
            <ShippingContext.Provider
                value={{ shippingState, dispatchShipping: jest.fn() }}
            >
                <CarrierModal isOpen={true} onClose={() => {}} />
            </ShippingContext.Provider>,
        );
    };

    it('renders Accounts and BillTos components', () => {
        const shippingState = {
            modalPage: 2,
            isNextDisabled: true,
        };
        renderWithContext(shippingState);
        expect(screen.getByTestId('mock-accounts')).toBeInTheDocument();
        expect(screen.getByTestId('mock-billTos')).toBeInTheDocument();
    });

    it('disables Next button on initial render', async () => {
        const shippingState = {
            modalPage: 2,
            isNextDisabled: true,
        };
        renderWithContext(shippingState);
        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
        });
    });

    it('enables Next button when selectedAccount is set', async () => {
        const shippingState = {
            modalPage: 2,
            selectedBillingType: 'BILL_SHIPPER',
            selectedAccount: { id: 1 },
            isNextDisabled: false,
        };
        renderWithContext(shippingState);
        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
        });
    });

    it('disables Next button when selectedAccount is not set', async () => {
        const shippingState = {
            modalPage: 2,
            selectedBillingType: 'BILL_SHIPPER',
            selectedAccount: null,
            isNextDisabled: true,
        };
        renderWithContext(shippingState);
        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
        });
    });
});
