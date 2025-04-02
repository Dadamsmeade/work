import React, { useState, useMemo } from 'react';
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Input,
    chakra,
    Box,
    Button,
    Select,
} from '@chakra-ui/react';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import {
    useReactTable,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
} from '@tanstack/react-table';
import Error from '../Error/error';
import RenderRow from './renderRow';

const DataTable = ({
    data,
    columns,
    editable,
    dispatch,
    onRowSelect = () => {},
    onInputChange = () => {},
    onMeasurementChange = () => {},
    onInputFocus = () => {},
    getBgStyle = () => 'transparent',
    cursor,
    disableHover,
    pagination,
    filterColumns,
    dropdown,
    getRowStyle = () => {},
    getHeaderStyle = () => ({}),
    getCellStyle = () => ({}),
}) => {
    const [sorting, setSorting] = useState([]);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filter, setFilter] = useState('');
    const defaultHeaderStyle = {
        bg: 'blue.300',
        color: 'black',
        borderBottom: 'none',
        top: '0',
        _hover: { cursor: 'pointer' },
        position: 'sticky',
        zIndex: '1',
    };

    const handlePageSizeChange = e => {
        const newPageSize = parseInt(e.target.value, 10);
        setPageSize(newPageSize);
        setCurrentPage(1);
    };

    const handleFilterChange = value => {
        setFilter(value);
    };

    const filteredData = useMemo(() => {
        return filterColumns
            ? data?.filter(row =>
                  Object.values(row).some(value =>
                      String(value ?? '')
                          .toLowerCase()
                          .includes(filter.toLowerCase()),
                  ),
              )
            : data;
    }, [data, filter]);

    const totalPages = useMemo(
        () => Math.ceil(filteredData?.length / pageSize),
        [filteredData, pageSize],
    );

    const handlePageChange = newPage => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleRowSelect = rowData => {
        setSelectedRowId(rowData.id);
        onRowSelect(rowData, dispatch);
    };

    const tableConfig = useMemo(
        () => ({
            columns,
            data: filteredData,
            getCoreRowModel: getCoreRowModel(),
            onSortingChange: setSorting,
            getSortedRowModel: getSortedRowModel(),
            state: {
                sorting,
            },
        }),
        [columns, filteredData, sorting],
    );

    const table = useReactTable(tableConfig);

    const renderRows = () => {
        const rows = pagination
            ? table
                  ?.getRowModel()
                  ?.rows?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
            : table?.getRowModel()?.rows;

        return rows?.map((row, rowIndex) => (
            <Tr
                key={row.id}
                bg={getBgStyle(row, rowIndex, 'selected')}
                onClick={() => handleRowSelect(row)}
                _hover={
                    !disableHover &&
                    row.id !== selectedRowId && {
                        bg: 'gray.700',
                        cursor: cursor,
                    }
                }
                {...getRowStyle(row, rowIndex)}
            >
                <RenderRow
                    editable={editable}
                    dispatch={dispatch}
                    onInputChange={onInputChange}
                    onMeasurementChange={onMeasurementChange}
                    onInputFocus={onInputFocus}
                    row={row}
                    rowIndex={rowIndex}
                    selectedRowId={selectedRowId}
                    dropdown={dropdown}
                    getRowStyle={getRowStyle}
                    getCellStyle={getCellStyle}
                />
            </Tr>
        ));
    };

    return (
        <Box>
            {filterColumns && (
                <Input
                    placeholder="Search..."
                    value={filter}
                    onChange={e => handleFilterChange(e.target.value)}
                    mb={4}
                />
            )}
            {table ? (
                <Table colorScheme="whiteAlpha">
                    <Thead>
                        {table?.getHeaderGroups()?.map(headerGroup => (
                            <Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header, headerIndex) => {
                                    const meta = header.column.columnDef.meta;
                                    // Merge the default style with any custom style for this header.
                                    const mergedHeaderStyle =
                                        typeof getHeaderStyle === 'function'
                                            ? {
                                                  ...defaultHeaderStyle,
                                                  ...getHeaderStyle(header, headerIndex),
                                              }
                                            : defaultHeaderStyle;

                                    return (
                                        <Th
                                            key={header.id}
                                            onClick={header.column.getToggleSortingHandler()}
                                            isNumeric={meta?.isNumeric}
                                            {...mergedHeaderStyle}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                            <chakra.span pl="4">
                                                {header.column.getIsSorted() ? (
                                                    header.column.getIsSorted() ===
                                                    'desc' ? (
                                                        <TriangleDownIcon aria-label="sorted descending" />
                                                    ) : (
                                                        <TriangleUpIcon aria-label="sorted ascending" />
                                                    )
                                                ) : null}
                                            </chakra.span>
                                        </Th>
                                    );
                                })}
                            </Tr>
                        ))}
                    </Thead>

                    <Tbody>
                        {filteredData?.length > 0 ? (
                            renderRows()
                        ) : (
                            <Tr>
                                <Td colSpan={columns.length}>
                                    <Error status={'info'} error={'No records found.'} />
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            ) : (
                <Error status={'error'} error={'Something went wrong.'} />
            )}
            {pagination && totalPages > 0 && (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mt={4}
                >
                    <Box>
                        <Select value={pageSize} onChange={handlePageSizeChange}>
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="50">50 per page</option>
                            <option value="100">100 per page</option>
                        </Select>
                    </Box>
                    <Box>
                        <Button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            mr={2}
                        >
                            First
                        </Button>
                        <Button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            mr={2}
                        >
                            Previous
                        </Button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            ml={2}
                            mr={2}
                        >
                            Next
                        </Button>
                        <Button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            Last
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default DataTable;
