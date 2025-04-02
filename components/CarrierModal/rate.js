import React, { useEffect, useContext, useState } from 'react';
import { PlexCustomerContext } from '../../context/plexCustomerContext';
import { ShippingContext } from '../../context/shippingContext';
import { Box, Text, Flex, Spinner } from '@chakra-ui/react';
import { getRate } from '../../api/index';
import { useRouter } from 'next/router';
import { CheckCircleIcon } from '@chakra-ui/icons';
import RateDetails from './rateDetails';
import CarrierError from './carrierError';
import CarrierLayout from './carrierLayout';

const Rate = () => {
    const { plexCustomerState } = useContext(PlexCustomerContext);
    const { shippingState, dispatchShipping } = useContext(ShippingContext);
    const {
        selectedAccount,
        selectedService,
        rateQuote,
        selectedCarrier,
        formData,
        packages,
        isSaturdayDelivery,
    } = shippingState;
    const { shipperKey } = useRouter().query;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({ rate: null });

    useEffect(() => {
        if (rateQuote) {
            setLoading(false);
            return;
        }

        getRate(
            plexCustomerState,
            shipperKey,
            formData.Ship_From,
            selectedService.Integrated_Shipping_Service,
            selectedAccount.Account_No,
            selectedCarrier.Name,
            {
                customerName: formData.Customer_Name,
                customerAddress: formData.Customer_Address,
                city: formData.City,
                state: formData.State,
                zip: formData.Zip,
                phone: formData.Phone,
                packages: packages?.data,
                options: {
                    isSaturdayDelivery: isSaturdayDelivery,
                },
            },
        )
            .then(res => {
                dispatchShipping({
                    type: 'SET_RATE_QUOTE',
                    payload: res.data,
                });
                setLoading(false);
                dispatchShipping({ type: 'DISABLE_NEXT_BUTTON', payload: false });
            })
            .catch(error => {
                console.error('An error occurred during rate fetch: ', error);
                const errorDetails = error.response?.data.errors
                    ? { message: error.message, details: error.response.data.errors }
                    : { message: 'Failed to fetch rate.' };
                setError({ rate: errorDetails });
                setLoading(false);
            });
    }, [selectedService, selectedCarrier, packages, rateQuote]);

    return loading ? (
        <Flex height="100vh" justifyContent="center" alignItems="center">
            <Spinner />
        </Flex>
    ) : (
        <CarrierLayout>
            <Box backgroundColor="gray.900" p={4} borderRadius="md" boxShadow="sm">
                <Text mb={6} fontSize="xl" color="blue.300" fontWeight="semibold">
                    <CheckCircleIcon color="blue.300" w={6} h={6} /> Rate Quote
                </Text>
                {error.rate && <CarrierError error={error.rate} />}
                {!error.rate && <RateDetails rateQuote={rateQuote} />}
            </Box>
        </CarrierLayout>
    );
};

export default Rate;
