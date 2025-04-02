import React from 'react';
import { Td, Input, chakra, Box, RadioGroup } from '@chakra-ui/react';
import { flexRender } from '@tanstack/react-table';
import Link from 'next/link';
import RandomRadio from '../RandomRadio/randomRadio';
import TableDocumentSelect from '../TableDocumentSelect/tableDocumentSelect';

const RenderRow = ({
    editable,
    dispatch,
    onInputChange = () => {},
    onMeasurementChange = () => {},
    onInputFocus = () => {},
    dropdown,
    getRowStyle = () => {},
    getCellStyle = () => ({}),
    row,
    rowIndex,
    selectedRowId,
}) => {
    const handleInputChange = (e, row, column) => {
        // todo, this should be a prop passed from the Packages table on Carrier Integration, like `onMeasurementChange`
        const allowNumericOnly = column.columnDef.meta?.allowNumericOnly;
        let value = e.target.value;

        if (!allowNumericOnly) {
            onInputChange(value, row, column, dispatch);
            return;
        }

        // Allow only numbers and a single decimal point
        value = value.replace(/[^0-9.]/g, '');

        // If more than one decimal point is entered, remove the last character
        const hasMultipleDecimals = (value.match(/\./g) || []).length > 1;
        if (hasMultipleDecimals) {
            value = value.slice(0, -1);
        }

        // Do not convert to number yet, leave as string to allow partial decimal input
        onInputChange(value, row, column, dispatch);
    };

    return row.getVisibleCells().map((cell, cellIndex) => {
        const meta = cell.column.columnDef.meta;
        const isEditable = editable?.includes(cell.column.columnDef.accessorKey);

        // Guard clause for dropdown rendering
        if (dropdown && dropdown(cell)) {
            return (
                <Td key={cell.id} isNumeric={meta?.isNumeric} border="none">
                    {dropdown(cell)}
                </Td>
            );
        }

        if (cell.column.columnDef.accessorKey === 'Measurement') {
            const isAttribute = row.original.Tolerance_Type === 'Attribute';
            return (
                <Td key={cell.id} {...getCellStyle(cell, cellIndex, rowIndex)}>
                    {isAttribute ? (
                        (() => {
                            const measurement = cell.getValue()?.[0];
                            return (
                                <Box mb={1}>
                                    <RadioGroup
                                        name={`attribute-${rowIndex}`}
                                        size="md"
                                        value={measurement?.value?.toString()}
                                        onChange={value =>
                                            // Create a synthetic event with the new value and pass the hardcoded key
                                            onMeasurementChange(
                                                { target: { value } },
                                                row,
                                                '0',
                                            )
                                        }
                                    >
                                        <Box display="flex" alignItems="center" gap={4}>
                                            <RandomRadio
                                                row={row}
                                                onInputFocus={onInputFocus}
                                                isInvalid={
                                                    measurement &&
                                                    measurement.inRange === false
                                                }
                                                selectedValue={measurement?.value?.toString()}
                                            />
                                        </Box>
                                    </RadioGroup>
                                </Box>
                            );
                        })()
                    ) : (
                        <Box display="flex" flexDirection="column" gap={2}>
                            {Object.keys(cell.getValue()).map(key => {
                                const measurement = cell.getValue()[key];
                                const measurementStyle =
                                    row.original.Measurement[key].inRange === false
                                        ? { bg: 'red.600' }
                                        : {};
                                const placeholder = `Value ${parseInt(key) + 1}`;
                                return (
                                    <Input
                                        {...measurementStyle}
                                        key={key}
                                        type="text"
                                        step="0.01"
                                        placeholder={placeholder}
                                        size="md"
                                        zIndex="0"
                                        height="50px"
                                        value={measurement.value}
                                        onFocus={() => onInputFocus(row)}
                                        onChange={e => onMeasurementChange(e, row, key)}
                                    />
                                );
                            })}
                        </Box>
                    )}
                </Td>
            );
        }

        // If column accessorKey is "Control_Plan_Line_Documents", render the URL as a clickable link.
        if (cell.column.columnDef.accessorKey === 'Control_Plan_Line_Documents') {
            const cellValue = cell.getValue();
            return (
                <Td key={cell.id} isNumeric={meta?.isNumeric} border="none">
                    {Array.isArray(cellValue) && cellValue.length ? (
                        <TableDocumentSelect
                            cellValue={cellValue}
                            rowId={row.original.Virtual_Key}
                            activeRowId={selectedRowId}
                        />
                    ) : (
                        <span></span>
                    )}
                </Td>
            );
        }

        // Guard clause for editable cells
        if (isEditable) {
            return (
                <Td
                    key={cell.id}
                    isNumeric={meta?.isNumeric}
                    {...getCellStyle(cell, cellIndex, rowIndex)}
                >
                    <Input
                        type="text"
                        value={cell.getValue()}
                        onChange={e => handleInputChange(e, row, cell.column)}
                        minWidth="80px"
                        textAlign="center"
                    />
                </Td>
            );
        }

        // Default case: Render cell content
        const cellContent = flexRender(cell.column.columnDef.cell, cell.getContext());

        // todo, this should be passed as a prop
        if (cell.column.columnDef.accessorKey === 'Shipper_No') {
            return (
                <Td key={cell.id} isNumeric={meta?.isNumeric} border="none">
                    <Link href={`/shipping/${cell.row.original.Shipper_Key}`}>
                        <chakra.span
                            _hover={{
                                fontWeight: 'bold',
                                textDecoration: 'underline',
                            }}
                        >
                            {cellContent}
                        </chakra.span>
                    </Link>
                </Td>
            );
        }

        // todo, this should be passed as a prop
        if (cell.column.columnDef.accessorKey === 'Workcenter_Key') {
            return (
                <Td key={cell.id} isNumeric={meta?.isNumeric} border="none">
                    <Link href={`/dynamic-check/${cell.row.original.Workcenter_Key}`}>
                        <chakra.span
                            _hover={{
                                fontWeight: 'bold',
                                textDecoration: 'underline',
                            }}
                        >
                            {cellContent}
                        </chakra.span>
                    </Link>
                </Td>
            );
        }

        // todo, this should be passed as a prop
        if (cell.column.columnDef.accessorKey === 'Label') {
            return (
                <Td key={cell.id} isNumeric={meta?.isNumeric} border="none">
                    <Link href={`/connections/${cell.row.original.Service}`}>
                        <chakra.span
                            _hover={{
                                fontWeight: 'bold',
                                textDecoration: 'underline',
                            }}
                        >
                            {cellContent}
                        </chakra.span>
                    </Link>
                </Td>
            );
        }

        // Default rendering for other cells
        return (
            <Td
                key={cell.id}
                isNumeric={meta?.isNumeric}
                border={getRowStyle() ?? 'none'}
                borderRight={getRowStyle()?.borderRight}
                borderBottom={getRowStyle()?.borderBottom}
                {...getCellStyle(cell, cellIndex, rowIndex)} // Apply styles to cells
            >
                {cellContent}
            </Td>
        );
    });
};

export default RenderRow;
