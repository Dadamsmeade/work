import React from 'react';
import { Box, Text, Grid, GridItem, VStack } from '@chakra-ui/react';

const ErrorDetail = ({ label, value }) => (
    <Box>
        {label && (
            <Text color="white" fontWeight="bold" mb={1}>
                {label}
            </Text>
        )}
        <Text color="white" mb={2}>
            {value}
        </Text>
    </Box>
);

const ErrorDetailObject = ({ detail }) => (
    <Box pl={4} borderLeft="2px solid white" mb={2}>
        {Object.entries(detail).map(([key, value]) => (
            <ErrorDetail key={key} label={`${key}:`} value={value} />
        ))}
    </Box>
);

const ChecksheetError = ({ error, generic }) => {
    if (!error && !generic) return null;

    // Extract the main error message from nested error properties if available.
    const mainErrorMessage = error?.data?.message || generic;

    return (
        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
            {/* Left column left empty */}
            <GridItem />
            {/* Center column: error box */}
            <GridItem>
                <Box p={4} backgroundColor="yellow.600" borderRadius="md" mb={4}>
                    <VStack spacing={3} align="stretch">
                        <Text color="white">
                            An error occurred trying to process your request:
                        </Text>
                        {generic && <Text color="white">{generic}</Text>}
                        {mainErrorMessage && (
                            <ErrorDetail label="Message:" value={mainErrorMessage} />
                        )}
                        {Array.isArray(error?.data?.details) &&
                            error.data.details.map((detail, index) => (
                                <Box key={index}>
                                    <Text color="white" fontWeight="bold" mb={1}>
                                        {`Detail ${index + 1}:`}
                                    </Text>
                                    {typeof detail === 'object' ? (
                                        <ErrorDetailObject detail={detail} />
                                    ) : (
                                        <ErrorDetail value={detail} />
                                    )}
                                </Box>
                            ))}
                        {error?.status && (
                            <ErrorDetail label="Status:" value={error.status} />
                        )}
                        {error?.statusText && (
                            <ErrorDetail label="Code:" value={error.statusText} />
                        )}
                    </VStack>
                </Box>
            </GridItem>
            {/* Right column left empty */}
            <GridItem />
        </Grid>
    );
};

export default ChecksheetError;
