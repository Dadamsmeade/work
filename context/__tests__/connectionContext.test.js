import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    ConnectionContext,
    AccountProvider as ConnectionProvider,
} from '../connectionContext';

const TestComponent = () => {
    const { connectionState, dispatchConnection } = useContext(ConnectionContext);
    return (
        <div>
            <div data-testid="state">{JSON.stringify(connectionState)}</div>
            <button onClick={() => dispatchConnection({ type: 'TEST_ACTION' })}>
                Dispatch
            </button>
        </div>
    );
};

describe('ConnectionContext', () => {
    it('provides the initial state', () => {
        render(
            <ConnectionProvider>
                <TestComponent />
            </ConnectionProvider>,
        );

        const stateElement = screen.getByTestId('state');
        const state = JSON.parse(stateElement.textContent);

        expect(state).toEqual({
            service: 'fedEx',
            type: 'fedEx',
            userEmail: '{{user_email}}',
            accountNumber: '740561073',
            accountNumberType: 'accountNumber',
            accountNumberExpiresOn: false,
            accountNumberNotBefore: '2024-01-13',
            consumerKey: 'l7352abe107fe54b7ea607e5e54c7210ad',
            consumerKeyType: 'consumerKey',
            consumerKeyExpiresOn: false,
            consumerKeyNotBefore: '2024-01-13',
            consumerSecret: '16942651744c4457afae808bf76c9e9d',
            consumerSecretType: 'consumerSecret',
            consumerSecretExpiresOn: '2024-01-13',
            consumerSecretNotBefore: '',
        });
    });

    it('provides a dispatch function', () => {
        render(
            <ConnectionProvider>
                <TestComponent />
            </ConnectionProvider>,
        );

        expect(screen.getByText('Dispatch')).toBeInTheDocument();
    });
});
