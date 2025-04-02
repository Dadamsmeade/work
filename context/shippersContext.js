import React, { createContext, useReducer } from 'react';
import shippersReducer from '../reducers/shippersReducer';

const initialState = {
    enableShippers: null,
    error: null,
    selectedShipper: null,
    selectedRowIds: [],
    shippers: null,
};

export const ShippersContext = createContext(initialState);
export const ShippersProvider = props => {
    const [shippersState, dispatchShippers] = useReducer(shippersReducer, initialState);

    return (
        <ShippersContext.Provider value={{ shippersState, dispatchShippers }}>
            {props.children}
        </ShippersContext.Provider>
    );
};
