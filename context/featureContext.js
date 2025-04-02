import React, { createContext, useReducer, useEffect, useContext } from 'react';
import featureReducer from '../reducers/featureReducer';
import { PlexCustomerContext } from './plexCustomerContext';
import { getFeatures } from '../api';

const initialState = {
    features: [],
};

export const FeatureContext = createContext(initialState);
export const FeatureProvider = props => {
    const { plexCustomerState } = useContext(PlexCustomerContext);
    const [featureState, dispatchFeature] = useReducer(featureReducer, initialState);

    useEffect(() => {
        if (plexCustomerState?.pcid) {
            getFeatures(plexCustomerState) // this needs to getFeaturesByPcid
                .then(res => {
                    dispatchFeature({
                        type: 'SET_FEATURES',
                        payload: res.data,
                    });
                })
                .catch(err => console.error(err));
        }
    }, [plexCustomerState]);

    return (
        <FeatureContext.Provider value={{ featureState, dispatchFeature }}>
            {props.children}
        </FeatureContext.Provider>
    );
};
