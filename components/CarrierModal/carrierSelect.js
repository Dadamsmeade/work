import React, { useEffect, useContext, useState } from 'react';
import { PlexCustomerContext } from '../../context/plexCustomerContext';
import { ShippingContext } from '../../context/shippingContext';
import { Box, Text, Flex, Spinner, SimpleGrid } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { getEnabledCarriers } from '../../api/index';
import CarrierLayout from './carrierLayout';

const CarrierSelect = () => {
    const { plexCustomerState } = useContext(PlexCustomerContext);
    const { shippingState, dispatchShipping } = useContext(ShippingContext);
    const { enabledCarriers, formData, residential, containers, selectedCarrier } =
        shippingState;
    const [loading, setLoading] = useState(true);

    const handleSelectCarrier = carrier => {
        const isSameCarrier = selectedCarrier?.Label === carrier.Label;
        if (!isSameCarrier) {
            dispatchShipping({
                type: 'CLEAR_STATE',
                payload: {
                    // clear all except:
                    enabledCarriers: enabledCarriers,
                    formData: formData,
                    residential: residential,
                    containers: containers,
                },
            });
        }

        const newSelectedCarrier = isSameCarrier ? null : carrier;
        dispatchShipping({
            type: 'SET_SELECTED_CARRIER',
            payload: newSelectedCarrier,
        });

        dispatchShipping({
            type: 'DISABLE_NEXT_BUTTON',
            payload: !newSelectedCarrier,
        });
    };

    useEffect(() => {
        if (!selectedCarrier) {
            dispatchShipping({
                type: 'DISABLE_NEXT_BUTTON',
                payload: true,
            });
        }
    }, [selectedCarrier]);

    useEffect(() => {
        getEnabledCarriers(plexCustomerState)
            .then(carriers =>
                dispatchShipping({
                    type: 'SET_ENABLED_CARRIERS',
                    payload: carriers.data,
                }),
            )
            .catch(error => console.error(error));
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <Flex height="100vh" justifyContent="center" alignItems="center">
                <Spinner />
            </Flex>
        );
    }

    return (
        <CarrierLayout>
            <Box backgroundColor="gray.900" p={4} borderRadius="md" boxShadow="sm">
                <Text mb={6} fontSize="xl" color="blue.300" fontWeight="semibold">
                    <CheckCircleIcon color="blue.300" w={6} h={6} /> Select Carrier
                </Text>
                {enabledCarriers?.map((item, i) => (
                    <Box
                        key={i}
                        p={3}
                        backgroundColor={
                            selectedCarrier?.Label === item.Label
                                ? item.Settings?.colors?.secondary
                                : 'gray.700'
                        }
                        borderRadius="md"
                        mb={3}
                        cursor="pointer"
                        _hover={{
                            backgroundColor:
                                selectedCarrier?.Label === item.Label
                                    ? item.Settings?.colors?.hover
                                    : 'gray.600',
                        }}
                        onClick={() => handleSelectCarrier(item)}
                    >
                        <SimpleGrid columns={1} spacing={4}>
                            <Text textAlign="center">{item.Label}</Text>
                        </SimpleGrid>
                    </Box>
                ))}
            </Box>
        </CarrierLayout>
    );
};

export default CarrierSelect;
