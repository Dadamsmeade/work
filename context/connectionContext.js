import React, { createContext, useReducer } from 'react';
import connectionReducer from '../reducers/connectionReducer';

const initialState = {
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
};

export const ConnectionContext = createContext(initialState);
export const AccountProvider = props => {
    const [connectionState, dispatchConnection] = useReducer(
        connectionReducer,
        initialState,
    );

    return (
        <ConnectionContext.Provider value={{ connectionState, dispatchConnection }}>
            {props.children}
        </ConnectionContext.Provider>
    );
};
