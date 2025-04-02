import React, { createContext, useReducer } from 'react';
import accountReducer from '../reducers/accountReducer';

const initialState = { account: null };

export const AccountContext = createContext(initialState);
export const AccountProvider = props => {
    const [accountState, dispatchAccount] = useReducer(accountReducer, initialState);

    return (
        <AccountContext.Provider value={{ accountState, dispatchAccount }}>
            {props.children}
        </AccountContext.Provider>
    );
};
