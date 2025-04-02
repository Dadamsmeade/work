import React from 'react';
import { Box, Text, Grid, GridItem, UnorderedList, ListItem } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';

const ErrorDetail = ({ label, value }) => (
    <>
        <GridItem>
            <Text color="white" mb={2}>
                {label}
            </Text>
        </GridItem>
        <GridItem>
            <Text color="white" mb={2}>
                {value}
            </Text>
        </GridItem>
    </>
);

const CarrierError = ({ error, generic }) => {
    if (!error && !generic) return null;

    return (
        <>
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                <GridItem colSpan={1}>
                    <Text mb={6} color="yellow.300" fontWeight="semibold">
                        <WarningIcon color="yellow.300" w={6} h={6} /> Processing Error
                    </Text>
                </GridItem>
            </Grid>
            <Box p={3} backgroundColor="yellow.600" borderRadius="md" mb={3}>
                <Text color="white" mb={4}>
                    An error occurred when the carrier tried to process your request:
                </Text>

                {/* Display a generic error message */}
                {generic && <Text>{generic}</Text>}

                {/* Display the main error message only */}
                {error?.message && (
                    <ErrorDetail label={error.label} value={error.message} />
                )}

                {/* Display details if they exist */}
                {error?.details &&
                    error?.details?.map((el, i) => (
                        <Box
                            key={i}
                            border="1px"
                            borderColor="whiteAlpha.300"
                            borderRadius="md"
                            p={3}
                            mb={3}
                        >
                            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                {el.code && <ErrorDetail label="Code:" value={el.code} />}
                                {el.message && (
                                    <ErrorDetail label="Message:" value={el.message} />
                                )}
                                {el.parameterList && (
                                    <>
                                        <GridItem>
                                            <Text color="white" mb={2}>
                                                Details:
                                            </Text>
                                        </GridItem>
                                        <GridItem>
                                            <UnorderedList color="white" pl={4}>
                                                {el.parameterList?.map(
                                                    (param, paramIndex) => (
                                                        <ListItem key={paramIndex}>
                                                            {`${param.key}: ${param.value}`}
                                                        </ListItem>
                                                    ),
                                                )}
                                            </UnorderedList>
                                        </GridItem>
                                    </>
                                )}
                            </Grid>
                        </Box>
                    ))}
            </Box>
        </>
    );
};

export default CarrierError;
