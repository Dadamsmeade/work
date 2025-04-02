import React, { createContext, useReducer } from 'react';
import dynamicCheckReducer from '../reducers/dynamicCheckReducer';

const initialState = {
    checksheet: null,
    workcenterCode: null,
    note: null,
    checksheetId: null,
    previewUrl: null,
    previewFileType: null,
    selectedRowIndex: null,
    activeDocIndex: 0,
    activeDocSource: null,
    isModalOpen: false,
};

export const DynamicCheckContext = createContext(initialState);
export const DynamicCheckProvider = props => {
    const reducer = dynamicCheckReducer(initialState);
    const [dynamicCheckState, dispatchDynamicCheck] = useReducer(reducer, initialState);

    return (
        <DynamicCheckContext.Provider value={{ dynamicCheckState, dispatchDynamicCheck }}>
            {props.children}
        </DynamicCheckContext.Provider>
    );
};
