import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AccountContext, AccountProvider } from '../accountContext';

const TestComponent = () => {
    const { accountState, dispatchAccount } = useContext(AccountContext);
    return (
        <div>
            <div data-testid="state">{JSON.stringify(accountState)}</div>
            <button onClick={() => dispatchAccount({ type: 'TEST_ACTION' })}>
                Dispatch
            </button>
        </div>
    );
};

describe('AccountContext', () => {
    it('provides the initial state', () => {
        render(
            <AccountProvider>
                <TestComponent />
            </AccountProvider>,
        );

        const stateElement = screen.getByTestId('state');
        const state = JSON.parse(stateElement.textContent);

        expect(state).toEqual({
            account: null,
        });
    });

    it('provides a dispatch function', () => {
        render(
            <AccountProvider>
                <TestComponent />
            </AccountProvider>,
        );

        expect(screen.getByText('Dispatch')).toBeInTheDocument();
    });
});
