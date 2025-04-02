import React, { useContext } from 'react';
import { ShippingContext } from '../../context/shippingContext';
import { Box, Text, SimpleGrid, Grid, GridItem, Flex, Spacer } from '@chakra-ui/react';
import PackageLabel from './packageLabel';

const renderFedEx = (confirmation, selectedBillingType) => {
    if (!confirmation?.output?.transactionShipments)
        return <Text color="whiteAlpha.800">Confirmation not available</Text>;

    const shipment = confirmation?.output?.transactionShipments[0];
    const totalNetCharge =
        shipment?.completedShipmentDetail?.shipmentRating?.shipmentRateDetails[0]
            ?.totalNetCharge;
    const totalNetFedExCharge =
        shipment?.completedShipmentDetail?.shipmentRating?.shipmentRateDetails[0]
            ?.totalNetFedExCharge;
    const shipmentSurcharges =
        shipment?.completedShipmentDetail?.shipmentRating?.shipmentRateDetails[0]
            ?.surcharges || [];

    return (
        <>
            <Box
                mt={4}
                backgroundColor="green.700"
                p={4}
                borderRadius="md"
                boxShadow="sm"
            >
                <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                    <GridItem colSpan={1}>
                        <Text mb={6} fontSize="xl" fontWeight="semibold">
                            Confirmation
                        </Text>
                    </GridItem>
                </Grid>
            </Box>
            <Box p={3} backgroundColor="gray.700" borderRadius="md" mb={3}>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                    Shipment Details
                </Text>
                <SimpleGrid columns={2} spacing={1.5}>
                    <Text>Master Tracking No:</Text>
                    <Text>{shipment?.masterTrackingNumber}</Text>
                    <Text>Service Type:</Text>
                    <Text>{shipment?.serviceName}</Text>
                    <Text>Shipment Date:</Text>
                    <Text>{shipment?.shipDatestamp}</Text>
                    {selectedBillingType === 'BILL_SHIPPER' && (
                        <>
                            <Text>Total Net FedEx Charge:</Text>
                            <Text>
                                <Text>
                                    $
                                    {totalNetCharge !== null &&
                                    totalNetCharge !== undefined
                                        ? parseFloat(totalNetFedExCharge).toFixed(2)
                                        : 'Courtesy Rate not available'}
                                </Text>
                            </Text>
                        </>
                    )}
                </SimpleGrid>
                {shipmentSurcharges.length > 0 && (
                    <>
                        <Text fontSize="lg" fontWeight="bold" mt={6} mb={4}>
                            Shipment Surcharges
                        </Text>
                        <SimpleGrid columns={2} spacing={1.5}>
                            {shipmentSurcharges.map((surcharge, index) => (
                                <React.Fragment key={index}>
                                    <Text>{surcharge.description}:</Text>
                                    <Text>${surcharge.amount.toFixed(2)}</Text>
                                </React.Fragment>
                            ))}
                        </SimpleGrid>
                    </>
                )}
                <Text fontSize="lg" fontWeight="bold" mt={6} mb={4}>
                    Package Details
                </Text>
                {confirmation?.combinedPackages ? (
                    confirmation.combinedPackages.map(
                        ({ piece, completedDetail }, index) => (
                            <Box
                                key={index}
                                backgroundColor="gray.600"
                                p={3}
                                borderRadius="md"
                                mb={3}
                                position="relative"
                            >
                                <Flex>
                                    <Box flex="1">
                                        <SimpleGrid columns={2} spacing={1.5}>
                                            <Text>Package Sequence No:</Text>
                                            <Text>{piece?.packageSequenceNumber}</Text>
                                            <Text>Tracking No:</Text>
                                            <Text>{piece?.trackingNumber}</Text>
                                            <Text>Delivery Date:</Text>
                                            <Text>{piece?.deliveryDatestamp}</Text>
                                            {selectedBillingType === 'BILL_SHIPPER' && (
                                                <>
                                                    <Text>Base Rate Amount:</Text>
                                                    <Text>
                                                        {/* handles bug on FedEx test API passing nullish base rate */}
                                                        {piece?.baseRateAmount?.toFixed(
                                                            2,
                                                        ) === '0.00'
                                                            ? 'N/A'
                                                            : `$${parseFloat(
                                                                  piece?.baseRateAmount,
                                                              ).toFixed(2)}`}
                                                    </Text>
                                                </>
                                            )}
                                        </SimpleGrid>
                                        {completedDetail?.packageRating
                                            ?.packageRateDetails?.[0]?.surcharges
                                            ?.length > 0 && (
                                            <Box mt={0} p={3}>
                                                <Text
                                                    fontSize="md"
                                                    fontWeight="bold"
                                                    mb={2}
                                                >
                                                    Package Surcharges:
                                                </Text>
                                                <SimpleGrid columns={2} spacing={1.5}>
                                                    {completedDetail?.packageRating?.packageRateDetails?.[0]?.surcharges?.map(
                                                        (surcharge, i) => (
                                                            <React.Fragment key={i}>
                                                                <Text>
                                                                    {
                                                                        surcharge?.description
                                                                    }
                                                                    :
                                                                </Text>
                                                                <Text>
                                                                    $
                                                                    {surcharge?.amount?.toFixed(
                                                                        2,
                                                                    )}
                                                                </Text>
                                                            </React.Fragment>
                                                        ),
                                                    )}
                                                </SimpleGrid>
                                            </Box>
                                        )}
                                    </Box>
                                    <Spacer />
                                    <Box>
                                        <PackageLabel packageDetail={piece} />
                                    </Box>
                                </Flex>
                            </Box>
                        ),
                    )
                ) : (
                    <Text>No package details available</Text>
                )}
            </Box>
        </>
    );
};

const renderUps = (confirmation, selectedBillingType) => {
    const { ShipmentResults } = confirmation.ShipmentResponse;
    const {
        ShipmentCharges,
        BillingWeight,
        ShipmentIdentificationNumber,
        PackageResults, // This might be an object or an array
    } = ShipmentResults;
    const { TransportationCharges, ServiceOptionsCharges, TotalCharges } =
        ShipmentCharges;
    const { Weight, UnitOfMeasurement } = BillingWeight;
    // Normalize PackageResults to ensure it's always an array
    const normalizedPackageResults = Array.isArray(PackageResults)
        ? PackageResults
        : [PackageResults];

    return (
        <>
            <Box
                mt={4}
                backgroundColor="green.700"
                p={4}
                borderRadius="md"
                boxShadow="sm"
            >
                <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                    <GridItem colSpan={1}>
                        <Text mb={6} fontSize="xl" fontWeight="semibold">
                            Confirmation
                        </Text>
                    </GridItem>
                </Grid>
            </Box>
            <Box p={3} backgroundColor="gray.700" borderRadius="md" mb={3}>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                    Shipment Details
                </Text>
                <SimpleGrid columns={2} spacing={1} mb={4}>
                    <Text>Shipment Identification No:</Text>
                    <Text>{ShipmentIdentificationNumber}</Text>
                    <Text>Billing Weight:</Text>
                    <Text>{`${Weight} ${UnitOfMeasurement?.Code}`}</Text>
                    {selectedBillingType === 'BILL_SHIPPER' && (
                        <>
                            <Text>Transportation Charges:</Text>
                            <Text>{`$${parseFloat(
                                TransportationCharges?.MonetaryValue,
                            ).toFixed(2)} ${TransportationCharges?.CurrencyCode}`}</Text>
                            <Text>Service Options Charges:</Text>
                            <Text>{`$${parseFloat(
                                ServiceOptionsCharges?.MonetaryValue,
                            ).toFixed(2)} ${ServiceOptionsCharges?.CurrencyCode}`}</Text>
                            <Text>Total Charges:</Text>
                            <Text>{`$${parseFloat(TotalCharges?.MonetaryValue).toFixed(
                                2,
                            )} ${TotalCharges?.CurrencyCode}`}</Text>
                        </>
                    )}
                </SimpleGrid>
                {normalizedPackageResults?.map((packageResult, index) => (
                    <Box
                        key={index}
                        p={3}
                        backgroundColor="gray.500"
                        borderRadius="md"
                        mb={3}
                    >
                        <Text fontSize="md" fontWeight="bold" mb={2}>
                            Package {index + 1}
                        </Text>
                        <SimpleGrid columns={2} spacing={1}>
                            <Text>Tracking No:</Text>
                            <Text>{packageResult?.TrackingNumber}</Text>
                            {selectedBillingType === 'BILL_SHIPPER' && (
                                <>
                                    <Text>Service Options Charges:</Text>
                                    <Text>{`$${parseFloat(
                                        packageResult?.ServiceOptionsCharges
                                            ?.MonetaryValue,
                                    ).toFixed(2)} ${
                                        packageResult?.ServiceOptionsCharges?.CurrencyCode
                                    }`}</Text>
                                </>
                            )}
                        </SimpleGrid>
                    </Box>
                ))}
            </Box>
        </>
    );
};
const ShipmentConfirmation = () => {
    const { shippingState } = useContext(ShippingContext);
    const { shipmentConfirmation, selectedCarrier, selectedBillingType } = shippingState;

    if (shipmentConfirmation && selectedCarrier?.Name === 'fedEx') {
        return renderFedEx(shipmentConfirmation, selectedBillingType);
    }

    if (shipmentConfirmation && selectedCarrier.Name === 'ups') {
        return renderUps(shipmentConfirmation, selectedBillingType);
    }

    return null;
};

export default ShipmentConfirmation;
