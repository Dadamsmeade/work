import React, { useEffect, useContext, useState } from 'react';
import { getIntegratedShippingServices } from '../../api/index';
import { PlexCustomerContext } from '../../context/plexCustomerContext';
import { ShippingContext } from '../../context/shippingContext';
import { getTableColumns } from '../../lib/get-table-columns';
import { Box, Text, Flex, Spinner, Checkbox } from '@chakra-ui/react';
import Error from '../Error/error';
import DataTable from '../DataTable/dataTable';
import { CheckCircleIcon } from '@chakra-ui/icons';
import CarrierLayout from './carrierLayout';

const Services = () => {
    const { plexCustomerState } = useContext(PlexCustomerContext);
    const { shippingState, dispatchShipping } = useContext(ShippingContext);
    const { services, selectedCarrier, selectedService, isSaturdayDelivery } =
        shippingState;
    const columns = getTableColumns(services?.columns);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({ services: null });
    const [showSaturdayDelivery, setShowSaturdayDelivery] = useState(false); // State to control visibility
    const saturdayDeliveryCodes = ['FIRSTOVERNIGHT', 'PRIORITYOVERNIGHT', '02', '12'];

    useEffect(() => {
        if (services) {
            setLoading(false);
            return;
        }

        setLoading(true);
        getIntegratedShippingServices(plexCustomerState, {
            fields: [
                'Carrier_Code',
                'Integrated_Shipping_Service',
                'Integrated_Shipping_Service_Type',
                'Integrated_Shipping_Provider',
                'Integrated_Shipping_Provider_Type',
                'Default_Service',
            ],
            hidden: [
                'Carrier_No',
                'Integrated_Shipping_Service_Key',
                'Integrated_Shipping_Service_Type_Key',
                'Integrated_Shipping_Service_Code',
                'LTL_Flag',
                'Integrated_Shipping_Provider_Key',
                'Integrated_Shipping_Provider_Type_Key',
            ],
            integratedShippingProviderTypeKeys: [
                selectedCarrier.Integrated_Shipping_Provider_Type_Key,
            ],
        })
            .then(res => {
                dispatchShipping({
                    type: 'SET_SERVICES',
                    payload: res.data,
                });
                setLoading(false);
            })
            .catch(error => {
                console.error('An error occurred while fetching services:', error);
                setErrors({ services: 'Failed to load services.' });
                setLoading(false);
            });
    }, [plexCustomerState, selectedCarrier, services]);

    useEffect(() => {
        const isServiceSelected = !!selectedService;
        dispatchShipping({ type: 'DISABLE_NEXT_BUTTON', payload: !isServiceSelected });
    }, [selectedService, dispatchShipping]);

    useEffect(() => {
        dispatchShipping({
            type: 'SET_RATE_QUOTE',
            payload: null,
        });
    }, []); // make a hard reset of rateQuote although this causes a minor bug if the user does not actually select a different service

    useEffect(() => {
        const isSaturday = saturdayDeliveryCodes.includes(
            selectedService?.Integrated_Shipping_Service_Code,
        );

        if (isSaturdayDelivery) {
            setShowSaturdayDelivery(isSaturday);
            return;
        }
        setShowSaturdayDelivery(false); // default to false
        dispatchShipping({ type: 'SET_IS_SATURDAY_DELIVERY', payload: false });

        if (selectedService) {
            setShowSaturdayDelivery(isSaturday);
        }
    }, [selectedService]);

    return loading ? (
        <Flex height="100vh" justifyContent="center" alignItems="center">
            <Spinner />
        </Flex>
    ) : errors.services ? (
        <Error status={'error'} error={errors.services} />
    ) : (
        <CarrierLayout>
            <Box backgroundColor="gray.900" p={4} borderRadius="md" boxShadow="sm">
                <Text mb={6} fontSize="xl" color="blue.300" fontWeight="semibold">
                    <CheckCircleIcon color="blue.300" w={6} h={6} /> Select Service
                </Text>
                <DataTable
                    data={services?.data}
                    columns={columns}
                    selected={shippingState.selectedService}
                    dispatch={dispatchShipping}
                    onRowSelect={row => {
                        // this should probably use a Virtual_Key instead
                        const carrierNo = row.original.Carrier_No;
                        const integratedShippingServiceKey =
                            row.original.Integrated_Shipping_Service_Key;

                        shippingState.selectedService?.Carrier_No === carrierNo &&
                        shippingState.selectedService?.Integrated_Shipping_Service_Key ===
                            integratedShippingServiceKey
                            ? dispatchShipping({
                                  type: 'SET_SELECTED_SERVICE',
                                  payload: null,
                              })
                            : dispatchShipping({
                                  type: 'SET_SELECTED_SERVICE',
                                  payload: row?.original,
                              });
                    }}
                    getBgStyle={(row, rowIndex) => {
                        return shippingState.selectedService?.Carrier_No ===
                            row?.original.Carrier_No &&
                            shippingState.selectedService
                                ?.Integrated_Shipping_Service_Key ===
                                row?.original?.Integrated_Shipping_Service_Key
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
                {showSaturdayDelivery && (
                    <Box mt={4}>
                        <Checkbox
                            isChecked={isSaturdayDelivery}
                            // onChange={e => setIsSaturdayDelivery(e.target.checked)}
                            onChange={e =>
                                dispatchShipping({
                                    type: 'SET_IS_SATURDAY_DELIVERY',
                                    payload: e.target.checked,
                                })
                            }
                        >
                            Saturday Delivery
                        </Checkbox>
                    </Box>
                )}
            </Box>
        </CarrierLayout>
    );
};

export default Services;
