import React, { useState, useEffect, useContext } from 'react';
import { Select } from '@chakra-ui/react';
import { DynamicCheckContext } from '../../context/dynamicCheckContext';

const TableDocumentSelect = ({ cellValue, rowId, activeRowId }) => {
    const [selected, setSelected] = useState('');
    const { dispatchDynamicCheck } = useContext(DynamicCheckContext);

    useEffect(() => {
        if (rowId !== activeRowId) {
            setSelected('');
        }
    }, [rowId, activeRowId]);

    return (
        <Select
            value={selected}
            variant="outline"
            size="sm"
            onFocus={() => {
                const fileType = selected
                    ? cellValue?.find(doc => doc.url === selected)?.contentType || ''
                    : '';
                dispatchDynamicCheck({
                    type: 'SET_ACTIVE_DOCUMENT',
                    payload: {
                        previewFileType: fileType,
                        previewUrl: selected,
                        activeDocSource: 'Ref',
                    },
                });
            }}
            onChange={e => {
                const newValue = e.target.value;
                setSelected(newValue);
                const fileType = newValue
                    ? cellValue?.find(doc => doc.url === newValue)?.contentType || ''
                    : '';
                dispatchDynamicCheck({
                    type: 'SET_ACTIVE_DOCUMENT',
                    payload: {
                        previewFileType: fileType,
                        previewUrl: newValue,
                        activeDocSource: 'Ref',
                    },
                });
            }}
        >
            <option value="">View</option>
            {cellValue.map((doc, index) => (
                <option key={index} value={doc.url}>
                    {doc.name}
                </option>
            ))}
        </Select>
    );
};

export default TableDocumentSelect;
