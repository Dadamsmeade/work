import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PreferenceContext, PreferenceProvider } from '../preferenceContext';

const TestComponent = () => {
    const { preferenceState, dispatchPreference } = useContext(PreferenceContext);
    return (
        <div>
            <div data-testid="state">{JSON.stringify(preferenceState)}</div>
            <button onClick={() => dispatchPreference({ type: 'TEST_ACTION' })}>
                Dispatch
            </button>
        </div>
    );
};

describe('PreferenceContext', () => {
    it('provides the initial state', () => {
        render(
            <PreferenceProvider>
                <TestComponent />
            </PreferenceProvider>,
        );

        const stateElement = screen.getByTestId('state');
        expect(stateElement.textContent).toBe('null');
    });

    it('provides a dispatch function', () => {
        render(
            <PreferenceProvider>
                <TestComponent />
            </PreferenceProvider>,
        );

        expect(screen.getByText('Dispatch')).toBeInTheDocument();
    });
});
