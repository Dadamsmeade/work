import React from 'react';
import { Alert, AlertIcon, AlertDescription, Box } from '@chakra-ui/react';

export default ({ error, status }) => (
    <Alert status={status} mb={4}>
        <AlertIcon />
        <Box flex="1">
            <AlertDescription display="block">{error}</AlertDescription>
        </Box>
    </Alert>
);
