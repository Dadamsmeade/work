import React, { useContext } from 'react';
import { Box, Text, SimpleGrid, Flex } from '@chakra-ui/react';
import { ShippingContext } from '../../context/shippingContext';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { getCarrierStyle } from '../../lib/get-carrier-style';

const IntegratedShipping = () => {
    const { shippingState } = useContext(ShippingContext);

    return (
        <SimpleGrid columns={{ base: 2, sm: 2, md: 2 }} gap={6}>
            <Box
                borderWidth="1px"
                borderRadius="lg"
                borderColor={getCarrierStyle(shippingState?.selectedCarrier)}
                overflow="hidden"
                p={4}
                boxShadow="lg"
                bg="gray.900"
            >
                <Flex
                    flexDirection="column"
                    align="center"
                    justify="center"
                    height="100%"
                >
                    <Box maxWidth="80%">
                        <SimpleGrid columns={2} gap={2} spacingY={2}>
                            <Text fontWeight="semibold">Bill From:</Text>
                            {shippingState.selectedAccount
                                ?.Integrated_Shipping_Account ? (
                                <Text>
                                    {
                                        shippingState.selectedAccount
                                            ?.Integrated_Shipping_Account
                                    }
                                </Text>
                            ) : (
                                <Text>None selected</Text>
                            )}

                            <Text fontWeight="semibold">Bill To:</Text>
                            {shippingState.selectedBillTo?.Integrated_Shipping_Bill_To ? (
                                <Text>
                                    {
                                        shippingState.selectedBillTo
                                            ?.Integrated_Shipping_Bill_To
                                    }
                                </Text>
                            ) : (
                                <Text>None selected</Text>
                            )}

                            <Text fontWeight="semibold">Service:</Text>
                            {shippingState.selectedService?.Carrier_Code ? (
                                <Text>{shippingState.selectedService?.Carrier_Code}</Text>
                            ) : (
                                <Text>None selected</Text>
                            )}

                            <Text fontWeight="semibold">Address Validation:</Text>
                            {shippingState.addressConfirmation ? (
                                <CheckCircleIcon color="green.300" w={6} h={6} />
                            ) : (
                                <Text>None selected</Text>
                            )}

                            <Text fontWeight="semibold">Shipment Confirmation:</Text>
                            {shippingState.shipmentConfirmation ? (
                                <CheckCircleIcon color="green.300" w={6} h={6} />
                            ) : (
                                <Text>Not confirmed</Text>
                            )}
                        </SimpleGrid>
                    </Box>
                </Flex>
            </Box>
        </SimpleGrid>
    );
};

export default IntegratedShipping;
