import React, { useEffect, useContext, useState } from 'react';
import {
    updateIntegratedShippingCustomerAddress,
    validateAddress,
} from '../../api/index';
import { PlexCustomerContext } from '../../context/plexCustomerContext';
import { ShippingContext } from '../../context/shippingContext';
import { Box, Button, Text, Flex, Spinner, Grid, GridItem } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { CheckCircleIcon, CheckIcon } from '@chakra-ui/icons';
import CarrierError from './carrierError';
import ValidatedAddress from './validatedAddress';
import CarrierLayout from './carrierLayout';

const Address = () => {
    const { plexCustomerState } = useContext(PlexCustomerContext);
    const { shippingState, dispatchShipping } = useContext(ShippingContext);
    const { validatedAddress, selectedCarrier, formData, residential } = shippingState;
    const { shipperKey } = useRouter().query;
    const [error, setError] = useState({ address: null, validatedAddress: null });
    const [validating, setValidating] = useState(false);
    const [showValidated, setShowValidated] = useState(false);
    const [validatedAddressReturned, setValidatedAddressReturned] = useState(false);
    const [noCandidateAddress, setNoCandidateAddress] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [acceptLoading, setAcceptLoading] = useState(false);
    const [validationCanceled, setValidationCanceled] = useState(false);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [cancelClicked, setCancelClicked] = useState(false);
    const [acceptClicked, setAcceptClicked] = useState(false);

    const handleValidateClick = () => {
        setValidating(true);
        dispatchShipping({ type: 'DISABLE_NEXT_BUTTON', payload: true });

        validateAddress(plexCustomerState, shipperKey, selectedCarrier.Name, {
            customerName: formData.Customer_Name,
            customerAddress: formData.Customer_Address,
            city: formData.City,
            state: formData.State,
            zip: formData.Zip,
        })
            .then(res => {
                dispatchShipping({
                    type: 'SET_VALIDATED_ADDRESS',
                    payload: res.data,
                });
                // FedEx
                if (res.data?.output?.resolvedAddresses) {
                    setValidatedAddressReturned(true);
                    return;
                }
                // UPS
                if (res.data?.XAVResponse?.ValidAddressIndicator === '') {
                    setValidatedAddressReturned(true);
                    return;
                }

                if (res.data?.XAVResponse?.NoCandidatesIndicator === '') {
                    setNoCandidateAddress(true);
                    return;
                }
            })
            .catch(error => {
                console.error('An error occurred during address validation: ', error);
                const errorDetails = error?.response?.data?.errors
                    ? { message: error.message, details: error.response.data.errors }
                    : { message: 'Failed to validate address.' };
                setError({ validatedAddress: errorDetails });
            })
            .finally(() => {
                setShowValidated(true);
                setValidating(false);
            });
    };

    const handleAcceptClick = async () => {
        setAcceptClicked(true);
        setAcceptLoading(true);
        setButtonsDisabled(true);

        try {
            const updatedCustomerAddress = await updateIntegratedShippingCustomerAddress(
                plexCustomerState,
                shipperKey,
                validatedAddress,
                formData.Customer_No,
                formData.Customer_Address_No,
                residential,
                selectedCarrier.Name,
            );

            dispatchShipping({
                type: 'SET_ADDRESS_CONFIRMATION',
                payload: updatedCustomerAddress?.data,
            });

            return updatedCustomerAddress?.data?.status === 200
                ? setUpdateMessage('Address Updated')
                : setUpdateMessage('Update Failed');
        } catch (error) {
            console.error(error);
            setUpdateMessage('Something went wrong.');
        } finally {
            setAcceptLoading(false);
            dispatchShipping({ type: 'DISABLE_NEXT_BUTTON', payload: false });
        }
    };

    const handleCancelClick = () => {
        setCancelClicked(true);
        setValidationCanceled(true);
        setButtonsDisabled(true);
        dispatchShipping({ type: 'DISABLE_NEXT_BUTTON', payload: false });
    };

    useEffect(() => {
        if (validatedAddress?.XAVResponse?.Response?.ResponseStatus?.Code === '1') {
            dispatchShipping({ type: 'DISABLE_NEXT_BUTTON', payload: false });
        }
    }, [validatedAddress, selectedCarrier]);

    return (
        <>
            <CarrierLayout>
                <Box backgroundColor="gray.900" p={4} borderRadius="md" boxShadow="sm">
                    <Text fontSize="xl" mb={6} color="blue.300" fontWeight="semibold">
                        <CheckCircleIcon color="blue.300" w={6} h={6} /> Validate Address
                    </Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                        <GridItem colSpan={1}>
                            <Text mb={6} fontWeight="semibold">
                                Ship To Address:
                            </Text>
                        </GridItem>
                        <GridItem colSpan={1}>
                            <Text color="whiteAlpha.800">
                                {formData?.Customer_Address}
                            </Text>
                            <Text color="whiteAlpha.800">
                                {formData?.City}, {formData?.State}
                                &nbsp;&nbsp;{formData?.Zip}
                            </Text>
                            <Text color="whiteAlpha.800">{`${formData?.Country}`}</Text>
                        </GridItem>
                        <GridItem colSpan={1}></GridItem>
                    </Grid>
                </Box>
            </CarrierLayout>
            <Flex justifyContent="center">
                <Button
                    colorScheme="gray"
                    onClick={handleValidateClick}
                    mt={4}
                    mb={4}
                    isDisabled={
                        validating || validatedAddressReturned || noCandidateAddress
                    }
                >
                    {validating ? <Spinner /> : 'Validate'}
                </Button>
            </Flex>
            {showValidated && (
                <>
                    <CarrierLayout>
                        <Box
                            backgroundColor="gray.900"
                            p={4}
                            borderRadius="md"
                            boxShadow="sm"
                        >
                            {error?.validatedAddress ? (
                                <CarrierError error={error?.validatedAddress} />
                            ) : validationCanceled ? (
                                <Box p={4} backgroundColor="red.500" borderRadius="md">
                                    <Text color="white">
                                        Address validation canceled.
                                    </Text>
                                </Box>
                            ) : (
                                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                                    <GridItem colSpan={1}>
                                        <Text
                                            color="green.200"
                                            mb={6}
                                            fontWeight="semibold"
                                        >
                                            Validated Address:
                                        </Text>
                                    </GridItem>
                                    <GridItem colSpan={1}>
                                        <ValidatedAddress
                                            validatedAddress={validatedAddress}
                                        />
                                    </GridItem>
                                    <GridItem colSpan={1}></GridItem>
                                </Grid>
                            )}
                        </Box>
                    </CarrierLayout>
                    <Flex justifyContent="center">
                        <Button
                            colorScheme="green"
                            onClick={handleAcceptClick}
                            mt={4}
                            mr={4}
                            isDisabled={
                                acceptLoading ||
                                buttonsDisabled ||
                                !!error?.validatedAddress ||
                                cancelClicked ||
                                noCandidateAddress
                            }
                        >
                            {acceptLoading ? <Spinner /> : 'Accept'}
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleCancelClick}
                            mt={4}
                            mb={4}
                            isDisabled={
                                cancelClicked || acceptClicked || noCandidateAddress
                            }
                        >
                            {'Cancel'}
                        </Button>
                    </Flex>
                    {updateMessage && (
                        <CarrierLayout>
                            <Box
                                backgroundColor="gray.900"
                                p={4}
                                borderRadius="md"
                                boxShadow="sm"
                            >
                                <Text mt={0} color="green.200" textAlign="center">
                                    <CheckIcon color="green.200" w={6} h={6} />{' '}
                                    {updateMessage}
                                </Text>
                            </Box>
                        </CarrierLayout>
                    )}
                </>
            )}
        </>
    );
};

export default Address;
