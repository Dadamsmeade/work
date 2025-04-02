import React, { useContext } from 'react';
import { ShippingContext } from '../../context/shippingContext';
import { Box, Text, SimpleGrid } from '@chakra-ui/react';

const ConfirmShipment = () => {
    const { shippingState } = useContext(ShippingContext);
    const {
        formData,
        selectedAccount,
        selectedBillTo,
        selectedService,
        rateQuote,
        selectedBillingType,
    } = shippingState;

    return (
        <>
            <Box p={3} backgroundColor="gray.700" borderRadius="md" mb={3}>
                <SimpleGrid columns={2} spacing={1.5}>
                    <Text>Service:</Text>
                    <Text>{selectedService?.Integrated_Shipping_Service}</Text>

                    <Text>Bill From:</Text>
                    <Text>{selectedAccount?.Integrated_Shipping_Account}</Text>
                    {selectedBillTo && (
                        <>
                            <Text>Bill To:</Text>
                            <Text>{selectedBillTo?.Integrated_Shipping_Bill_To}</Text>
                        </>
                    )}
                    <Text>Ship To Contact:</Text>
                    <Box>
                        <Text>{formData?.Contact_Note}</Text>
                    </Box>
                    <Text>Ship To:</Text>
                    <Box>
                        <Text>{formData?.Customer_Address}</Text>
                        <Text>
                            {`${formData?.City}, ${formData?.State} ${formData?.Zip} ${formData?.Country}`}
                        </Text>
                    </Box>
                    <Text>Billing Type:</Text>
                    <Text>{selectedBillingType}</Text>
                </SimpleGrid>
            </Box>
            {rateQuote?.output?.rateReplyDetails?.map(
                (
                    detail,
                    index, // FedEx
                ) => (
                    <Box
                        key={index}
                        p={3}
                        backgroundColor="gray.700"
                        borderRadius="md"
                        mb={3}
                    >
                        <SimpleGrid columns={2} spacing={4}>
                            <Text>Estimated Total:</Text>
                            <Text>
                                $
                                {parseFloat(
                                    detail?.ratedShipmentDetails?.[0]
                                        ?.totalNetFedExCharge,
                                ).toFixed(2)}
                            </Text>
                        </SimpleGrid>
                    </Box>
                ),
            )}
            {rateQuote?.RateResponse && ( // UPS
                <>
                    <Box p={3} backgroundColor="gray.700" borderRadius="md" mb={3}>
                        <SimpleGrid columns={2} spacing={1.5}>
                            <Text>Estimated Total:</Text>
                            <Text>
                                $
                                {parseFloat(
                                    rateQuote?.RateResponse?.RatedShipment?.TotalCharges
                                        ?.MonetaryValue,
                                ).toFixed(2)}
                            </Text>

                            <Text>Billing Weight:</Text>
                            <Text>
                                {
                                    rateQuote?.RateResponse?.RatedShipment?.BillingWeight
                                        ?.Weight
                                }{' '}
                                {
                                    rateQuote?.RateResponse?.RatedShipment?.BillingWeight
                                        ?.UnitOfMeasurement?.Description
                                }
                            </Text>
                        </SimpleGrid>
                    </Box>
                </>
            )}
        </>
    );
};

export default ConfirmShipment;
