import React, { useContext } from 'react';
import { Box } from '@chakra-ui/react';
import { ShippingContext } from '../../context/shippingContext';

const CarrierLayout = ({ children }) => {
    const { shippingState } = useContext(ShippingContext);
    const { selectedCarrier } = shippingState;
    const borderColor = selectedCarrier?.Settings?.colors?.secondary || 'gray.500';

    return (
        <Box
            border="1px"
            borderColor={borderColor}
            backgroundColor={borderColor}
            borderRadius="md"
        >
            {children}
        </Box>
    );
};

export default CarrierLayout;
