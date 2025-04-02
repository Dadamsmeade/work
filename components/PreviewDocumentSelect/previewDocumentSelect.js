import React, { useState, useContext } from 'react';
import { Select } from '@chakra-ui/react';
import { DynamicCheckContext } from '../../context/dynamicCheckContext';

const PreviewDocumentSelect = () => {
    const [selected, setSelected] = useState('');
    const { dynamicCheckState, dispatchDynamicCheck } = useContext(DynamicCheckContext);
    const { checksheet } = dynamicCheckState;
    const docs = checksheet?.data?.[0]?.Control_Plan_Documents || [];

    if (!docs?.length) return null;

    return (
        <Select
            value={selected}
            variant="outline"
            size="sm"
            onFocus={() => {
                const fileType = selected
                    ? docs.find(doc => doc.url === selected)?.contentType || ''
                    : '';
                dispatchDynamicCheck({
                    type: 'SET_ACTIVE_DOCUMENT',
                    payload: {
                        previewFileType: fileType,
                        previewUrl: selected,
                    },
                });
            }}
            onChange={e => {
                const newValue = e.target.value;
                setSelected(newValue);
                const fileType = newValue
                    ? docs.find(doc => doc.url === newValue)?.contentType || ''
                    : '';
                dispatchDynamicCheck({
                    type: 'SET_ACTIVE_DOCUMENT',
                    payload: {
                        previewFileType: fileType,
                        previewUrl: newValue,
                    },
                });
            }}
        >
            <option value="">Control Plan Assets</option>
            {docs.map((doc, index) => (
                <option key={index} value={doc.url}>
                    {doc.name}
                </option>
            ))}
        </Select>
    );
};

export default PreviewDocumentSelect;
