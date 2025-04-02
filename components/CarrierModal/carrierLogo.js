import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const CarrierLogo = ({ carrier }) => {
    if (!carrier) return null;

    if (carrier?.Label === 'UPS')
        return (
            <Box fontSize="xl" fontWeight="bold">
                <Text color={carrier?.Settings?.colors?.secondary}>{carrier?.Label}</Text>
            </Box>
        );

    if (carrier?.Label === 'FedEx') {
        return (
            <Box fontSize="xl" fontWeight="bold">
                <Text as="span" color={carrier?.Settings.colors.primary}>
                    Fed
                </Text>
                <Text as="span" color={carrier?.Settings.colors.secondary}>
                    Ex
                </Text>
            </Box>
        );
    }

    return null;
};

export default CarrierLogo;
