import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VoidAlert from '../voidAlert';
import { ShippingContext } from '../../../context/shippingContext';

describe('VoidAlert', () => {
    const mockDispatchShipping = jest.fn();
    const mockOnConfirm = jest.fn();

    const renderWithContext = (isVoidConfirmOpen = true) => {
        const shippingState = { isVoidConfirmOpen };
        return render(
            <ShippingContext.Provider
                value={{ shippingState, dispatchShipping: mockDispatchShipping }}
            >
                <VoidAlert onConfirm={mockOnConfirm} />
            </ShippingContext.Provider>,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the alert dialog when isVoidConfirmOpen is true', () => {
        renderWithContext(true);
        expect(screen.getByText('Void Shipment')).toBeInTheDocument();
        expect(
            screen.getByText("Are you sure? You can't undo this action afterwards."),
        ).toBeInTheDocument();
    });

    it('does not render the alert dialog when isVoidConfirmOpen is false', () => {
        renderWithContext(false);
        expect(screen.queryByText('Void Shipment')).not.toBeInTheDocument();
    });
});
