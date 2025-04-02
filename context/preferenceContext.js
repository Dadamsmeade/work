import React, { createContext, useReducer } from 'react';
import preferenceReducer from '../reducers/preferenceReducer';

const initialState = null;

export const PreferenceContext = createContext(initialState);
export const PreferenceProvider = props => {
    const [preferenceState, dispatchPreference] = useReducer(
        preferenceReducer,
        initialState,
    );

    return (
        <PreferenceContext.Provider value={{ preferenceState, dispatchPreference }}>
            {props.children}
        </PreferenceContext.Provider>
    );
};
