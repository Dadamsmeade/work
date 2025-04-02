import React, { useEffect, useContext, useState } from 'react';
import { getCustomerAddressIntegratedShippingProviderAccounts } from '../../api/index';
import { PlexCustomerContext } from '../../context/plexCustomerContext';
import { ShippingContext } from '../../context/shippingContext';
import { getTableColumns } from '../../lib/get-table-columns';
import { Box, Text, Flex, Divider, Spinner } from '@chakra-ui/react';
import Error from '../Error/error';
import DataTable from '../DataTable/dataTable';
import { CheckCircleIcon } from '@chakra-ui/icons';
import CarrierLayout from './carrierLayout';

const BillTos = () => {
    const { plexCustomerState } = useContext(PlexCustomerContext);
    const { shippingState, dispatchShipping } = useContext(ShippingContext);
    const { billTos, selectedCarrier, selectedBillingType } = shippingState;
    const billTosColumns = getTableColumns(billTos?.columns);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (billTos) {
            setLoading(false);
            return;
        }

        getCustomerAddressIntegratedShippingProviderAccounts(plexCustomerState, {
            fields: [
                'Integrated_Shipping_Account',
                'Account_No',
                'Integrated_Shipping_Bill_To',
                'Customer_Address_Code',
                'Customer_Code',
            ],
            hidden: ['Integrated_Shipping_Account_Key'],
        })
            .then(res => {
                dispatchShipping({
                    type: 'SET_BILL_TOS',
                    payload: res.data,
                });
            })
            .catch(error => {
                console.error('An error occurred while fetching bill-to accounts', error);
                setError('Failed to load bill-to accounts');
            })
            .finally(() => setLoading(false));
    }, [billTos, plexCustomerState, selectedCarrier]);

    if (selectedBillingType === 'BILL_SHIPPER') return null;

    if (loading)
        return (
            <Flex height="30vh" justifyContent="center" alignItems="center">
                <Spinner />
            </Flex>
        );

    if (error) return <Error status={'error'} error={error} />;

    return (
        <>
            <Divider my={10} />
            <CarrierLayout>
                <Box backgroundColor="gray.900" p={4} borderRadius="md" boxShadow="sm">
                    <Text mb={6} fontSize="xl" color="blue.300" fontWeight="semibold">
                        <CheckCircleIcon color="blue.300" w={6} h={6} /> Select Bill To
                    </Text>
                    <DataTable
                        data={billTos?.data}
                        columns={billTosColumns}
                        onRowSelect={row => {
                            // This might be cleaner if a Virtual_Key were assigned
                            const accountKey =
                                row.original.Integrated_Shipping_Account_Key; // these are already unique keys
                            const billToKey = row.original.Account_No;

                            shippingState.selectedBillTo
                                ?.Integrated_Shipping_Account_Key === accountKey &&
                            shippingState.selectedBillTo?.Account_No === billToKey
                                ? dispatchShipping({
                                      type: 'SET_SELECTED_BILL_TO',
                                      payload: null,
                                  })
                                : dispatchShipping({
                                      type: 'SET_SELECTED_BILL_TO',
                                      payload: row.original,
                                  });
                        }}
                        getBgStyle={(row, rowIndex) => {
                            return shippingState.selectedBillTo
                                ?.Integrated_Shipping_Account_Key ===
                                row.original.Integrated_Shipping_Account_Key &&
                                shippingState.selectedBillTo?.Account_No ===
                                    row.original.Account_No
                                ? selectedCarrier?.Settings?.colors?.secondary
                                : rowIndex % 2 === 0
                                ? 'gray.900'
                                : 'gray.800';
                        }}
                        getHeaderStyle={(header, index) => ({
                            top: '-5',
                        })}
                        cursor="pointer"
                        pagination={true}
                        filterColumns={true}
                    />
                </Box>
            </CarrierLayout>
        </>
    );
};

export default BillTos;
