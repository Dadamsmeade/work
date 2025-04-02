import React, { useEffect, useContext } from 'react';
import { ShippingContext } from '../../context/shippingContext';
import { Box, Text, SimpleGrid } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import CarrierLayout from './carrierLayout';
import { BILLING_TYPES } from '../../constants';

const BillingType = () => {
    const { shippingState, dispatchShipping } = useContext(ShippingContext);
    const {
        enabledCarriers,
        formData,
        residential,
        containers,
        packages,
        selectedBillingType,
        selectedCarrier,
        modalPage,
    } = shippingState;
    const backgroundColor = selectedCarrier?.Settings?.colors?.secondary;

    const handleSelectBillingType = billingType => {
        const isSameBillingType = selectedBillingType === billingType;
        if (!isSameBillingType) {
            dispatchShipping({
                type: 'CLEAR_STATE',
                payload: {
                    // clear state except these fields:
                    enabledCarriers: enabledCarriers,
                    selectedCarrier: selectedCarrier,
                    formData: formData,
                    residential: residential,
                    containers: containers,
                    packages: packages,
                    modalPage: modalPage,
                },
            });
        }
        const newSelectedBillingType = isSameBillingType ? null : billingType;
        dispatchShipping({
            type: 'SET_SELECTED_BILLING_TYPE',
            payload: newSelectedBillingType,
        });
        dispatchShipping({
            type: 'DISABLE_NEXT_BUTTON',
            payload: !newSelectedBillingType,
        });
    };

    useEffect(() => {
        if (!selectedBillingType) {
            dispatchShipping({
                type: 'DISABLE_NEXT_BUTTON',
                payload: true,
            });
        }
    }, [selectedBillingType]);

    return (
        <CarrierLayout>
            <Box backgroundColor="gray.900" p={4} borderRadius="md" boxShadow="sm">
                <Text mb={6} fontSize="xl" color="blue.300" fontWeight="semibold">
                    <CheckCircleIcon color="blue.300" w={6} h={6} /> Select Billing Type
                </Text>
                <Box
                    key={BILLING_TYPES.BILL_SHIPPER}
                    p={3}
                    backgroundColor={
                        selectedBillingType === BILLING_TYPES.BILL_SHIPPER
                            ? backgroundColor
                            : 'gray.700'
                    }
                    borderRadius="md"
                    mb={3}
                    cursor="pointer"
                    onClick={() => handleSelectBillingType(BILLING_TYPES.BILL_SHIPPER)}
                >
                    <SimpleGrid columns={1} spacing={4}>
                        <Text textAlign="center">Bill Shipper</Text>
                    </SimpleGrid>
                </Box>
                <Box
                    key={BILLING_TYPES.BILL_RECEIVER}
                    p={3}
                    backgroundColor={
                        selectedBillingType === BILLING_TYPES.BILL_RECEIVER
                            ? backgroundColor
                            : 'gray.700'
                    }
                    borderRadius="md"
                    mb={3}
                    cursor="pointer"
                    onClick={() => handleSelectBillingType(BILLING_TYPES.BILL_RECEIVER)}
                >
                    <SimpleGrid columns={1} spacing={4}>
                        <Text textAlign="center">Bill Receiver</Text>
                    </SimpleGrid>
                </Box>
                <Box
                    key={BILLING_TYPES.BILL_THIRD_PARTY}
                    p={3}
                    backgroundColor={
                        selectedBillingType === BILLING_TYPES.BILL_THIRD_PARTY
                            ? backgroundColor
                            : 'gray.700'
                    }
                    borderRadius="md"
                    mb={3}
                    cursor="pointer"
                    onClick={() =>
                        handleSelectBillingType(BILLING_TYPES.BILL_THIRD_PARTY)
                    }
                >
                    <SimpleGrid columns={1} spacing={4}>
                        <Text textAlign="center">Bill Third Party</Text>
                    </SimpleGrid>
                </Box>
            </Box>
        </CarrierLayout>
    );
};

export default BillingType;
