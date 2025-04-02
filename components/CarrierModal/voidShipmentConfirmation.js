import React, { useContext } from 'react';
import { ShippingContext } from '../../context/shippingContext';
import { Box, Text, SimpleGrid } from '@chakra-ui/react';
import CarrierError from './carrierError';

const renderFedExVoid = voidResponse => {
    return voidResponse ? (
        <Box mt={4} backgroundColor="gray.900" p={4} borderRadius="md" boxShadow="sm">
            <Text mb={6} fontSize="xl" color="red.300" fontWeight="semibold">
                Void Shipment Confirmation
            </Text>
            <Box p={3} backgroundColor="red.700" borderRadius="md" mb={3} color="white">
                <Text fontSize="lg" fontWeight="bold" mb={2}>
                    Transaction ID: {voidResponse?.transactionId}
                </Text>
                <SimpleGrid columns={2} spacing={1}>
                    <Text>Cancelled Shipment:</Text>
                    <Text>{voidResponse?.output?.cancelledShipment ? 'Yes' : 'No'}</Text>
                    <Text>Cancelled History:</Text>
                    <Text>{voidResponse?.output?.cancelledHistory ? 'Yes' : 'No'}</Text>
                </SimpleGrid>
                {voidResponse?.output?.alerts &&
                    voidResponse?.output?.alerts.length > 0 && (
                        <>
                            <Text fontSize="lg" fontWeight="bold" mt={4} mb={2}>
                                Alerts
                            </Text>
                            {voidResponse?.output?.alerts?.map((alert, index) => (
                                <Box key={index} mb={1}>
                                    <Text>{`Code: ${alert?.code}, Message: ${alert?.message}, Type: ${alert?.alertType}`}</Text>
                                </Box>
                            ))}
                        </>
                    )}
            </Box>
        </Box>
    ) : (
        <CarrierError generic={'Something went wrong.'} />
    );
};

const renderUpsVoid = voidResponse => {
    if (voidResponse && voidResponse.VoidShipmentResponse) {
        const { VoidShipmentResponse } = voidResponse;
        const { Response, SummaryResult } = VoidShipmentResponse;

        return (
            <Box mt={4} backgroundColor="gray.900" p={4} borderRadius="md" boxShadow="sm">
                <Text mb={6} fontSize="xl" color="red.300" fontWeight="semibold">
                    Void Shipment Confirmation
                </Text>
                <Box
                    p={3}
                    backgroundColor="red.700"
                    borderRadius="md"
                    mb={3}
                    color="white"
                >
                    <SimpleGrid columns={2} spacing={1}>
                        <Text>Response Code:</Text>
                        <Text>{Response.ResponseStatus.Code}</Text>
                        <Text>Response Description:</Text>
                        <Text>{Response.ResponseStatus.Description}</Text>
                        <Text>Status Code:</Text>
                        <Text>{SummaryResult.Status.Code}</Text>
                        <Text>Status Description:</Text>
                        <Text>{SummaryResult.Status.Description}</Text>
                    </SimpleGrid>
                </Box>
            </Box>
        );
    }

    return <CarrierError generic={'Something went wrong.'} />;
};

const VoidShipmentConfirmation = () => {
    const { shippingState } = useContext(ShippingContext);
    const { voidShipmentConfirmation, selectedCarrier } = shippingState;

    if (voidShipmentConfirmation && selectedCarrier.Name === 'fedEx') {
        return renderFedExVoid(voidShipmentConfirmation);
    }

    if (voidShipmentConfirmation && selectedCarrier.Name === 'ups') {
        return renderUpsVoid(voidShipmentConfirmation);
    }

    return null;
};

export default VoidShipmentConfirmation;
