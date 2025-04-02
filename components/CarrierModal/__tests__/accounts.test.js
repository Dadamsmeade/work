import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlexCustomerContext } from '../../../context/plexCustomerContext';
import { ShippingContext } from '../../../context/shippingContext';
import Accounts from '../accounts';
import * as api from '../../../api/index';
import '@testing-library/jest-dom';
import { mockPlexCustomerState } from '../../../mockData/index.js';

jest.mock('../../../api/index', () => ({
    getIntegratedShippingAccounts: jest.fn(),
}));

const getMockShippingState = () => {
    return {
        accounts: {
            status: 200,
            columns: ['Integrated_Shipping_Account', 'Account_No'],
            hidden: [
                'Integrated_Shipping_Account_Key',
                'Integrated_Shipping_Provider_Key',
            ],
            data: [
                {
                    Integrated_Shipping_Account_Key: 1,
                    Integrated_Shipping_Account: 'Cumulus [FedEx]',
                    Account_No: '202491560',
                },
                {
                    Integrated_Shipping_Account_Key: 2,
                    Integrated_Shipping_Account: 'Cumulus [UPS]',
                    Account_No: '26V07X',
                },
                {
                    Integrated_Shipping_Account_Key: 3,
                    Integrated_Shipping_Account: 'Ford Fedex',
                    Account_No: '434343Z',
                },
            ],
        },
    };
};

describe('Accounts component', () => {
    beforeEach(() => {
        api.getIntegratedShippingAccounts.mockReset();
    });

    it('renders accounts data correctly', async () => {
        const plexCustomerState = mockPlexCustomerState;
        const shippingState = getMockShippingState();
        const dispatchShipping = jest.fn();

        render(
            <PlexCustomerContext.Provider value={{ plexCustomerState }}>
                <ShippingContext.Provider value={{ shippingState, dispatchShipping }}>
                    <Accounts />
                </ShippingContext.Provider>
            </PlexCustomerContext.Provider>,
        );

        await waitFor(() => {
            expect(screen.getByText('Cumulus [FedEx]')).toBeInTheDocument();
            expect(screen.getByText('202491560')).toBeInTheDocument();
            expect(screen.getByText('Cumulus [UPS]')).toBeInTheDocument();
            expect(screen.getByText('26V07X')).toBeInTheDocument();
            expect(screen.getByText('Ford Fedex')).toBeInTheDocument();
            expect(screen.getByText('434343Z')).toBeInTheDocument();
        });
    });

    it('displays error message when account fetching fails', async () => {
        const plexCustomerState = mockPlexCustomerState;
        const shippingState = { ...getMockShippingState(), accounts: null };
        const dispatchShipping = jest.fn();

        api.getIntegratedShippingAccounts.mockRejectedValue(
            new Error('Failed to fetch accounts'),
        );

        render(
            <PlexCustomerContext.Provider value={{ plexCustomerState }}>
                <ShippingContext.Provider value={{ shippingState, dispatchShipping }}>
                    <Accounts />
                </ShippingContext.Provider>
            </PlexCustomerContext.Provider>,
        );

        await waitFor(() => {
            expect(screen.getByText('Failed to load accounts.')).toBeInTheDocument();
        });
    });

    it('applies correct styling to selected account', async () => {
        const plexCustomerState = mockPlexCustomerState;
        const shippingState = {
            ...getMockShippingState(),
            selectedAccount: getMockShippingState().accounts.data[0],
            selectedCarrier: { Settings: { colors: { secondary: '#ff0000' } } },
        };
        const dispatchShipping = jest.fn();

        api.getIntegratedShippingAccounts.mockResolvedValue({
            data: shippingState.accounts,
        });

        render(
            <PlexCustomerContext.Provider value={{ plexCustomerState }}>
                <ShippingContext.Provider value={{ shippingState, dispatchShipping }}>
                    <Accounts />
                </ShippingContext.Provider>
            </PlexCustomerContext.Provider>,
        );

        await waitFor(() => {
            const selectedRow = screen.getByText('Cumulus [FedEx]').closest('tr');
            expect(selectedRow).toHaveStyle('background-color: #ff0000');
        });
    });
});
