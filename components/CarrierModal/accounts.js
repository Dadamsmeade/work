import React, { useEffect, useContext, useState } from 'react';
import { getIntegratedShippingAccounts } from '../../api/index';
import { PlexCustomerContext } from '../../context/plexCustomerContext';
import { ShippingContext } from '../../context/shippingContext';
import { getTableColumns } from '../../lib/get-table-columns';
import { Box, Text, Flex, Spinner } from '@chakra-ui/react';
import Error from '../Error/error';
import DataTable from '../DataTable/dataTable';
import { CheckCircleIcon } from '@chakra-ui/icons';
import CarrierLayout from './carrierLayout';

const Accounts = () => {
    const { plexCustomerState } = useContext(PlexCustomerContext);
    const { shippingState, dispatchShipping } = useContext(ShippingContext);
    const { accounts, selectedCarrier } = shippingState;
    const accountsColumns = getTableColumns(accounts?.columns);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (accounts) {
            setLoading(false);
            return;
        }

        getIntegratedShippingAccounts(plexCustomerState, {
            fields: ['Integrated_Shipping_Account', 'Account_No'],
            hidden: [
                'Integrated_Shipping_Account_Key',
                'Integrated_Shipping_Provider_Key',
            ],
        })
            .then(res => {
                dispatchShipping({
                    type: 'SET_ACCOUNTS',
                    payload: res.data,
                });
            })
            .catch(error => {
                console.error('An error occurred while fetching accounts:', error);
                setError('Failed to load accounts.');
            })
            .finally(() => setLoading(false));
    }, [accounts, plexCustomerState, selectedCarrier]);

    return loading ? (
        <Flex height="30vh" justifyContent="center" alignItems="center">
            <Spinner />
        </Flex>
    ) : error ? (
        <Error status={'error'} error={error} />
    ) : (
        <>
            <CarrierLayout>
                <Box backgroundColor="gray.900" p={4} borderRadius="md" boxShadow="sm">
                    <Text mb={6} fontSize="xl" color="blue.300" fontWeight="semibold">
                        <CheckCircleIcon color="blue.300" w={6} h={6} /> Select Bill From
                    </Text>
                    <DataTable
                        data={accounts?.data}
                        columns={accountsColumns}
                        selected={shippingState.selectedAccount}
                        dispatch={dispatchShipping}
                        onRowSelect={row => {
                            const rowId = row.original.Integrated_Shipping_Account_Key;

                            shippingState.selectedAccount
                                ?.Integrated_Shipping_Account_Key === rowId
                                ? dispatchShipping({
                                      type: 'SET_SELECTED_ACCOUNT',
                                      payload: null,
                                  })
                                : dispatchShipping({
                                      type: 'SET_SELECTED_ACCOUNT',
                                      payload: row.original,
                                  });
                        }}
                        getBgStyle={(row, rowIndex) => {
                            return shippingState?.selectedAccount
                                ?.Integrated_Shipping_Account_Key ===
                                row?.original?.Integrated_Shipping_Account_Key
                                ? selectedCarrier?.Settings?.colors?.secondary
                                : rowIndex % 2 === 0
                                ? 'gray.900'
                                : 'gray.800';
                        }}
                        getHeaderStyle={(header, index) => ({
                            top: '-5',
                        })}
                        cursor="pointer"
                    />
                </Box>
            </CarrierLayout>
        </>
    );
};

export default Accounts;
