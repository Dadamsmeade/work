import React, { useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { getIntegratedShippingPackages } from '../../api/index';
import { PlexCustomerContext } from '../../context/plexCustomerContext';
import { ShippingContext } from '../../context/shippingContext';
import { getTableColumns } from '../../lib/get-table-columns';
import { Box, Text, Flex, Spinner, Select } from '@chakra-ui/react';
import Error from '../Error/error';
import DataTable from '../DataTable/dataTable';
import { CheckCircleIcon } from '@chakra-ui/icons';
import CarrierLayout from './carrierLayout';

const Packages = () => {
    const { plexCustomerState } = useContext(PlexCustomerContext);
    const { shippingState, dispatchShipping } = useContext(ShippingContext);
    const router = useRouter();
    const { shipperKey } = router.query;
    const { packages, selectedCarrier } = shippingState;

    // Dropdown configuration map for multiple columns
    const dropdownConfig = {
        Packaging_Type: packages?.selectable.packagingOptions,
        // Dummy_Type: packages?.selectable.dummyOptions, // in case we need to extend selectable dropdown to other fields
    };

    const renderDropdown = cell => {
        const dropdownOptions = dropdownConfig[cell.column.columnDef.accessorKey];

        if (dropdownOptions) {
            return (
                <Select
                    value={JSON.stringify(cell.getValue() || dropdownOptions[0].value)}
                    onChange={e => {
                        const selectedValue = JSON.parse(e.target.value);
                        dispatchShipping({
                            type: 'UPDATE_PACKAGE_DATA',
                            payload: {
                                rowId: cell.row.original.Virtual_Key,
                                columnId: cell.column.columnDef.accessorKey,
                                newValue: selectedValue,
                            },
                        });
                    }}
                >
                    {dropdownOptions.map(option => (
                        <option
                            key={option.value.val || option.value}
                            value={JSON.stringify(option.value)}
                        >
                            {option.label}
                        </option>
                    ))}
                </Select>
            );
        }

        return null;
    };

    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({ packages: null });

    const query = {
        fields: [
            'Plex_Record_Type',
            'Container_Key',
            'Serial_No',
            'Container_Description',
            'Length',
            'Width',
            'Height',
            'Weight',
            // 'Tracking_No',
            // 'Label_Data',
            // 'Label_Type',
            'PO_No',
        ],
    };

    useEffect(() => {
        dispatchShipping({
            type: 'SET_RATE_QUOTE',
            payload: null,
        });
    }, []);

    useEffect(() => {
        if (packages) {
            setLoading(false);
            return;
        }

        getIntegratedShippingPackages(
            plexCustomerState,
            shipperKey,
            selectedCarrier.Integrated_Shipping_Provider_Type_Key,
            query,
        )
            .then(res => {
                dispatchShipping({
                    type: 'SET_PACKAGES',
                    payload: res.data,
                });
                setLoading(false);
            })
            .catch(error => {
                console.error('An error occurred while fetching packages:', error);
                setErrors({ packages: 'Failed to load packages.' });
                setLoading(false);
            });
    }, [plexCustomerState, selectedCarrier]);

    const columns = packages?.columns
        ? getTableColumns(packages.columns, {}, [
              'Length',
              'Width',
              'Height',
              'Weight',
              'Declared_Value',
              'Packaging_Type',
          ])
        : [];

    return loading ? (
        <Flex height="100vh" justifyContent="center" alignItems="center">
            <Spinner />
        </Flex>
    ) : errors.packages ? (
        <Error status={'error'} error={errors.packages} />
    ) : (
        <CarrierLayout>
            <Box backgroundColor="gray.900" p={4} borderRadius="md" boxShadow="sm">
                <Text mb={6} fontSize="xl" color="blue.300" fontWeight="semibold">
                    <CheckCircleIcon color="blue.300" w={6} h={6} /> Package Details
                </Text>
                <DataTable
                    data={packages?.data}
                    columns={columns}
                    editable={packages?.editable}
                    selected={shippingState.selectedPackages}
                    dropdown={renderDropdown} // Pass the renderDropdown function
                    dispatch={dispatchShipping}
                    onRowSelect={row => {
                        const rowId = row.original.Virtual_Key;
                        shippingState.selectedPackages.some(
                            shipper => shipper.Virtual_Key === rowId,
                        )
                            ? dispatchShipping({
                                  type: 'UNSET_SELECTED_PACKAGE',
                                  payload: row.original,
                              })
                            : dispatchShipping({
                                  type: 'SET_SELECTED_PACKAGE',
                                  payload: row.original,
                              });
                    }}
                    onInputChange={(value, row, column, dispatch) => {
                        dispatch({
                            type: 'UPDATE_PACKAGE_DATA',
                            payload: {
                                rowId: row.original.Virtual_Key,
                                columnId: column.columnDef.accessorKey,
                                newValue: value,
                            },
                        });
                    }}
                    getBgStyle={(row, rowIndex) =>
                        shippingState.selectedPackages.some(
                            shipper => shipper.Virtual_Key === row.original.Virtual_Key,
                        )
                            ? selectedCarrier?.Settings?.colors?.secondary
                            : rowIndex % 2 === 0
                            ? 'gray.900'
                            : 'gray.800'
                    }
                    getHeaderStyle={(header, index) => ({
                        top: '-5',
                    })}
                    getCellStyle={(cell, cellIndex) => ({
                        borderBottom: 'none',
                    })}
                    disableHover={true}
                />
            </Box>
        </CarrierLayout>
    );
};

export default Packages;
