import React from 'react';
import { Text } from '@chakra-ui/react';

const AddressText = ({ children }) => <Text color="whiteAlpha.800">{children}</Text>;

const FedExAddress = address => {
    const addressLine = address?.streetLinesToken?.join(' ');
    const region = `${address?.city}, ${address?.stateOrProvinceCode} ${address?.postalCode}`;
    const countryCode = address?.countryCode;

    return (
        <>
            <AddressText>{addressLine}</AddressText>
            <AddressText>{region}</AddressText>
            <AddressText>{countryCode}</AddressText>
        </>
    );
};

const UPSAddress = address => {
    const addressLine = address?.AddressLine;
    const region = address?.Region;
    const countryCode = address?.CountryCode;

    return (
        <>
            <AddressText>{addressLine}</AddressText>
            <AddressText>{region}</AddressText>
            <AddressText>{countryCode}</AddressText>
        </>
    );
};

const ValidatedAddress = ({ validatedAddress }) => {
    const { output, XAVResponse } = validatedAddress;

    if (output?.resolvedAddresses) {
        return FedExAddress(output?.resolvedAddresses?.[0]);
    }

    if (XAVResponse?.ValidAddressIndicator === '') {
        return UPSAddress(XAVResponse?.Candidate?.[0]?.AddressKeyFormat);
    }

    return <AddressText>Address not available</AddressText>;
};

export default ValidatedAddress;
