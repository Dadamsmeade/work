import { useContext } from 'react';
import { Box, Text, Grid } from '@chakra-ui/react';
import { getCarrierStyle } from '../../lib/get-carrier-style';
import { ShippingContext } from '../../context/shippingContext';

const Card = ({ title, fields }) => {
    const { shippingState } = useContext(ShippingContext);
    const { selectedCarrier } = shippingState;

    return (
        <Box
            borderWidth="2px"
            borderRadius="sm"
            overflow="hidden"
            p={4}
            boxShadow="lg"
            borderColor={getCarrierStyle(selectedCarrier)}
        >
            <Text fontWeight="bold" fontSize="xl">
                {title}
            </Text>

            {fields.map((field, idx) => {
                if (Array.isArray(field)) {
                    // Render inline fields
                    return (
                        <Grid
                            templateColumns="1fr 1fr"
                            gap={0}
                            key={idx}
                            mt={field.some(f => f.label) ? 2 : 0}
                        >
                            <Box />
                            <Box display="flex" flexDirection="row" gap={2}>
                                {field.map((inlineField, inlineIdx) => (
                                    <Text key={inlineIdx} as="span">
                                        {inlineField.value}
                                    </Text>
                                ))}
                            </Box>
                        </Grid>
                    );
                }
                // Render single line field
                return (
                    <Grid
                        templateColumns="1fr 1fr"
                        gap={0}
                        key={idx}
                        mt={field.label ? 2 : 0}
                    >
                        <Box>
                            <Text fontWeight="semibold">
                                {field.label ? `${field.label}:` : ''}
                            </Text>
                        </Box>
                        <Box>
                            <Text>{field.value}</Text>
                        </Box>
                    </Grid>
                );
            })}
        </Box>
    );
};

export default Card;
