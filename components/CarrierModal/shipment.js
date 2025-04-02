import React, { useContext, useEffect, useState } from 'react';
import { PlexCustomerContext } from '../../context/plexCustomerContext';
import { ShippingContext } from '../../context/shippingContext';
import { ShippersContext } from '../../context/shippersContext';
import { Box, Button, Text, Flex, Spinner } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { syncShipment } from '../../api/index';
import { useRouter } from 'next/router';
import CarrierError from './carrierError';
import ConfirmShipment from './confirmShipment';
import ShipmentConfirmation from './shipmentConfirmation';
import LabelSelect from './labelSelect';
import ShippingLabel from './shippingLabel';
import CarrierLayout from './carrierLayout';
import VoidShipmentConfirmation from './voidShipmentConfirmation';

const Shipment = () => {
    const { plexCustomerState } = useContext(PlexCustomerContext);
    const { shippingState, dispatchShipping } = useContext(ShippingContext);
    const {
        formData,
        selectedAccount,
        selectedBillTo,
        selectedImageType,
        selectedStockType,
        selectedService,
        packages,
        containers,
        selectedCarrier,
        shipmentConfirmation,
        fetchingShipment,
        voidingShipment,
        selectedBillingType,
        isSaturdayDelivery,
    } = shippingState;
    const { shippersState } = useContext(ShippersContext);
    const { selectedShipper } = shippersState;
    const { Integrated_Shipping_Provider_Type_Key } = selectedCarrier;
    const { shipperKey } = useRouter().query;
    const [error, setError] = useState(null);

    const syncShipmentWrapper = async plexCustomerState => {
        dispatchShipping({
            // clear voided shipment in case user re-creates one
            type: 'SET_VOID_SHIPMENT_CONFIRMATION',
            payload: null,
        });
        dispatchShipping({
            type: 'SET_FETCHING_SHIPMENT',
            payload: true,
        });

        try {
            const { data } = await syncShipment(
                plexCustomerState,
                formData.Ship_From,
                selectedService.Integrated_Shipping_Service,
                formData.Shipper_No,
                selectedAccount.Account_No,
                selectedBillTo?.Account_No,
                selectedImageType?.value ?? selectedImageType, // while UPS only uses `GIF`
                selectedStockType,
                shipperKey,
                selectedService.Integrated_Shipping_Service_Key,
                selectedCarrier,
                selectedShipper,
                selectedBillingType,
                {
                    customerName: formData.Customer_Name,
                    customerAddress: formData.Customer_Address,
                    contactNote: formData.Contact_Note,
                    city: formData.City,
                    state: formData.State,
                    zip: formData.Zip,
                    phone: formData.Phone,
                    packages: packages.data,
                    containers: containers.data,
                    addModuleRevision: {
                        truckForm: {
                            applicationKey: 5562,
                            identityKey: null, // need the truckKey
                            moduleKey: 31,
                            originalText: '',
                            revisionBy: plexCustomerState.integrationPUN,
                            revisionDate: null,
                            revisionText: `Carrier updated to ${selectedCarrier.Label}`,
                        },
                    },
                    options: {
                        isSaturdayDelivery: isSaturdayDelivery,
                    },
                },
            );
            const {
                createdShipment,
                updatedIntegratedShipper,
                updatedIntegratedShippingConfirmation,
            } = data;

            dispatchShipping({
                type: 'SET_SHIPMENT_CONFIRMATION',
                payload: createdShipment,
            });
        } catch (error) {
            console.error('An error occurred during fetch shipment: ', error);
            const errorDetails = error.response?.data?.errors
                ? {
                      label: error.response.data.message,
                      message: error.message,
                      details: error.response.data.errors,
                  }
                : { message: 'An unknown error occurred' };
            setError(errorDetails);
        } finally {
            dispatchShipping({
                type: 'SET_FETCHING_SHIPMENT',
                payload: false,
            });
        }
    };

    useEffect(() => {
        dispatchShipping({ type: 'DISABLE_NEXT_BUTTON', payload: true });
    }, []);

    const checkDisabled = () => {
        if (fetchingShipment) return true;
        if (shipmentConfirmation) return true;
        if (Integrated_Shipping_Provider_Type_Key === 3 && !selectedImageType)
            return true;
        if (Integrated_Shipping_Provider_Type_Key === 3 && !selectedStockType)
            return true;
    };

    return (
        <CarrierLayout>
            <Box backgroundColor="gray.900" p={4} borderRadius="md" boxShadow="sm">
                <Text mb={6} fontSize="xl" color="blue.300" fontWeight="semibold">
                    <CheckCircleIcon color="blue.300" w={6} h={6} /> Confirm Shipment
                </Text>
                <ConfirmShipment />
                <LabelSelect />
                <Flex justifyContent="center">
                    <Button
                        colorScheme="green"
                        onClick={() => syncShipmentWrapper(plexCustomerState)}
                        mt={4}
                        mr={4}
                        isDisabled={checkDisabled()}
                    >
                        {fetchingShipment ? <Spinner /> : 'Create Shipment'}
                    </Button>

                    {shipmentConfirmation && (
                        <Button
                            colorScheme="red"
                            onClick={() => {
                                dispatchShipping({
                                    type: 'SET_IS_VOID_CONFIRM_OPEN',
                                    payload: true,
                                });
                            }}
                            isDisabled={voidingShipment}
                            mt={4}
                            mr={4}
                        >
                            {voidingShipment ? <Spinner /> : 'Void'}
                        </Button>
                    )}

                    <ShippingLabel />
                </Flex>
                <ShipmentConfirmation />
                {error && !shipmentConfirmation && <CarrierError error={error} />}
                <VoidShipmentConfirmation />
            </Box>
        </CarrierLayout>
    );
};

export default Shipment;
