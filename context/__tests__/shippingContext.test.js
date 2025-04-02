import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShippingContext, ShippingProvider } from '../shippingContext';

const TestComponent = () => {
    const { shippingState, dispatchShipping } = useContext(ShippingContext);
    return (
        <div>
            <div data-testid="state">{JSON.stringify(shippingState)}</div>
            <button onClick={() => dispatchShipping({ type: 'TEST_ACTION' })}>
                Dispatch
            </button>
        </div>
    );
};

describe('ShippingContext', () => {
    it('provides the initial state', () => {
        render(
            <ShippingProvider>
                <TestComponent />
            </ShippingProvider>,
        );

        const stateElement = screen.getByTestId('state');
        const state = JSON.parse(stateElement.textContent);

        expect(state).toEqual({
            formData: null,
            residential: null,
            containers: null,
            accounts: null,
            selectedAccount: null,
            billTos: null,
            selectedBillTo: null,
            services: null,
            selectedService: null,
            isSaturdayDelivery: false,
            packages: null,
            selectedPackages: [],
            validatedAddress: null,
            isNextDisabled: false,
            rateQuote: null,
            selectedImageType: null,
            selectedStockType: null,
            enabledCarriers: null,
            selectedCarrier: null,
            addressConfirmation: null,
            shipmentConfirmation: null,
            voidShipmentConfirmation: null,
            isVoidConfirmOpen: null,
            voidingShipment: false,
            shippingLabelData: null,
            selectedBillingType: null,
            modalPage: 0,
        });
    });

    it('provides a dispatch function', () => {
        render(
            <ShippingProvider>
                <TestComponent />
            </ShippingProvider>,
        );

        const dispatchButton = screen.getByText('Dispatch');
        expect(dispatchButton).toBeInTheDocument();
    });
});
