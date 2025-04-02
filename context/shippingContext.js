import React, { createContext, useReducer } from 'react';
import shippingReducer from '../reducers/shippingReducer';

const initialState = {
    formData: null,
    residential: null,
    containers: null,
    accounts: null, // bill from
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
};

export const ShippingContext = createContext(initialState);
export const ShippingProvider = props => {
    const reducer = shippingReducer(initialState);
    const [shippingState, dispatchShipping] = useReducer(reducer, initialState);

    return (
        <ShippingContext.Provider value={{ shippingState, dispatchShipping }}>
            {props.children}
        </ShippingContext.Provider>
    );
};
