import React, { useState } from 'react';
import { Box, Text, Tooltip } from '@chakra-ui/react';
import { SkipForward } from 'lucide-react';

const SkipChecksheet = ({ handleUpdateControlPlan }) => {
    const [clicked, setClicked] = useState(false);

    const handleClick = () => {
        setClicked(true);
        handleUpdateControlPlan({
            Active: false,
            Skip: true,
            Complete: false,
        });
    };

    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box></Box>
            <Tooltip label="Skip" aria-label="Skip button">
                <Box display="flex" alignItems="center">
                    <Text mr={2} textAlign="center">
                        Skip
                    </Text>
                    <Box
                        as="button"
                        onClick={handleClick}
                        sx={{
                            // Change background color on click, with a smooth transition
                            backgroundColor: clicked ? 'gray.300' : 'transparent',
                            transition: 'background-color 0.2s ease',
                            borderRadius: '4px',
                            p: 1,
                        }}
                    >
                        <SkipForward size={32} color="yellow" />
                    </Box>
                </Box>
            </Tooltip>
        </Box>
    );
};

export default SkipChecksheet;
