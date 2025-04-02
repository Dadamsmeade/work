import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShippersContext, ShippersProvider } from '../shippersContext';

const TestComponent = () => {
    const { shippersState, dispatchShippers } = useContext(ShippersContext);
    return (
        <div>
            <div data-testid="state">{JSON.stringify(shippersState)}</div>
            <button onClick={() => dispatchShippers({ type: 'TEST_ACTION' })}>
                Dispatch
            </button>
        </div>
    );
};

describe('ShippersContext', () => {
    it('provides the initial state', () => {
        render(
            <ShippersProvider>
                <TestComponent />
            </ShippersProvider>,
        );

        const stateElement = screen.getByTestId('state');
        const state = JSON.parse(stateElement.textContent);

        expect(state).toEqual({
            enableShippers: null,
            error: null,
            selectedShipper: null,
            selectedRowIds: [],
            shippers: null,
        });
    });

    it('provides a dispatch function', () => {
        render(
            <ShippersProvider>
                <TestComponent />
            </ShippersProvider>,
        );

        expect(screen.getByText('Dispatch')).toBeInTheDocument();
    });
});
