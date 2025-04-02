import React from 'react';
import { Box, Text, SimpleGrid } from '@chakra-ui/react';
import CarrierError from './carrierError';

const RateDetails = ({ rateQuote }) => {
    if (!rateQuote) return <CarrierError generic={'No rate details found.'} />;

    if (rateQuote?.output) {
        // FedEx
        return rateQuote?.output?.rateReplyDetails?.map((detail, index) => (
            <>
                <Box
                    key={index}
                    p={3}
                    backgroundColor="gray.700"
                    borderRadius="md"
                    mb={3}
                >
                    <SimpleGrid columns={2} spacing={1.5}>
                        <Text>Service:</Text>
                        <Text>{detail?.serviceType}</Text>

                        <Text>Packaging Type:</Text>
                        <Text>{detail?.packagingType}</Text>
                        <Text>Billing Weight:</Text>
                        <Text>
                            {`${detail?.ratedShipmentDetails?.[0].shipmentRateDetail?.totalBillingWeight?.value} ${detail?.ratedShipmentDetails?.[0].shipmentRateDetail?.totalBillingWeight?.units}`}
                        </Text>
                        <Text color="yellow.100" fontWeight="semibold">
                            Total Net FedEx Charge:
                        </Text>
                        <Text color="yellow.100" fontWeight="semibold">
                            $
                            {parseFloat(
                                detail?.ratedShipmentDetails?.[0]?.totalNetFedExCharge,
                            ).toFixed(2)}{' '}
                        </Text>
                    </SimpleGrid>
                </Box>
                {detail?.ratedShipmentDetails?.[0]?.ratedPackages?.map(
                    (packageDetail, pkgIndex) => (
                        <Box
                            key={pkgIndex}
                            p={3}
                            backgroundColor="gray.700"
                            borderRadius="md"
                            mb={3}
                        >
                            <SimpleGrid columns={2} spacing={1.5}>
                                <Text fontWeight="bold">
                                    Package {pkgIndex + 1} Details:
                                </Text>
                                <Text></Text>
                                <Text>Net FedEx Charge:</Text>
                                <Text>
                                    $
                                    {parseFloat(
                                        packageDetail?.packageRateDetail?.netFedExCharge,
                                    ).toFixed(2)}
                                </Text>
                                <Text>Weight:</Text>
                                <Text>
                                    {`${packageDetail?.packageRateDetail?.billingWeight?.value} ${packageDetail?.packageRateDetail?.billingWeight?.units}`}
                                </Text>
                                <Text>Base Charge:</Text>
                                <Text>
                                    $
                                    {parseFloat(
                                        packageDetail?.packageRateDetail?.baseCharge,
                                    ).toFixed(2)}
                                </Text>
                                <Text>Total Surcharges:</Text>
                                <Text>
                                    $
                                    {parseFloat(
                                        packageDetail?.packageRateDetail?.totalSurcharges,
                                    ).toFixed(2)}
                                </Text>
                                <Text>Total Discounts:</Text>
                                <Text>
                                    $
                                    {parseFloat(
                                        packageDetail?.packageRateDetail
                                            ?.totalFreightDiscounts,
                                    ).toFixed(2)}
                                </Text>
                            </SimpleGrid>
                        </Box>
                    ),
                )}
            </>
        ));
    }

    if (rateQuote?.RateResponse) {
        // UPS
        const { RatedShipment, Response } = rateQuote.RateResponse;
        const packages = Array.isArray(RatedShipment?.RatedPackage)
            ? RatedShipment?.RatedPackage
            : [RatedShipment?.RatedPackage];
        return (
            <>
                <Box p={3} backgroundColor="gray.700" borderRadius="md" mb={3}>
                    <SimpleGrid columns={2} spacing={1.5}>
                        <Text>Billing Weight:</Text>
                        <Text>{`${RatedShipment?.BillingWeight?.Weight} ${RatedShipment?.BillingWeight?.UnitOfMeasurement?.Code}`}</Text>
                        <Text>Transportation Charges:</Text>
                        <Text>
                            $
                            {parseFloat(
                                RatedShipment?.TransportationCharges?.MonetaryValue,
                            ).toFixed(2)}
                        </Text>
                        <Text>Service Options Charges:</Text>
                        <Text>
                            $
                            {parseFloat(
                                RatedShipment?.ServiceOptionsCharges?.MonetaryValue,
                            ).toFixed(2)}
                        </Text>
                        {Response?.Alert?.map(el => (
                            <>
                                <Text key={`alert-${el.Code}`}>Alert {el.Code}:</Text>
                                <Text key={`alert-desc-${el.Code}`}>
                                    {el.Description}
                                </Text>
                            </>
                        ))}

                        <Text color="yellow.100" fontWeight="semibold">
                            Total Charges:
                        </Text>
                        <Text color="yellow.100" fontWeight="semibold">
                            $
                            {parseFloat(
                                RatedShipment?.TotalCharges?.MonetaryValue,
                            ).toFixed(2)}
                        </Text>
                    </SimpleGrid>
                </Box>
                {packages?.map((packageDetail, index) => (
                    <Box
                        key={index}
                        p={3}
                        backgroundColor="gray.700"
                        borderRadius="md"
                        mb={3}
                    >
                        <SimpleGrid columns={2} spacing={1.5}>
                            <Text fontWeight="bold">Package {index + 1} Details:</Text>
                            <Text></Text>
                            <Text>Transportation Charges:</Text>
                            <Text>
                                $
                                {parseFloat(
                                    packageDetail?.TransportationCharges?.MonetaryValue,
                                ).toFixed(2)}
                            </Text>
                            <Text>Weight:</Text>
                            <Text>{packageDetail?.Weight} LBS</Text>
                            <Text>Billing Weight:</Text>
                            <Text>{packageDetail?.BillingWeight.Weight} LBS</Text>
                            <Text>Total Charges:</Text>
                            <Text>
                                $
                                {parseFloat(
                                    packageDetail?.TotalCharges?.MonetaryValue,
                                ).toFixed(2)}
                            </Text>
                        </SimpleGrid>
                    </Box>
                ))}
            </>
        );
    }

    return <CarrierError generic={'Something went wrong.'} />;
};

export default RateDetails;
