import React, { useState } from 'react';
import { Box, Text, Tooltip, keyframes } from '@chakra-ui/react';
import { Zap } from 'lucide-react';

// Define keyframes for pulsing effect
const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

// This function returns both the icon color and tooltip label based on status props
const getStatusProps = (sseSource, error, checksheet) => {
    if (sseSource && error) {
        return { iconColor: 'orange', label: 'Click to fetch again..' };
    }
    if (sseSource && checksheet) {
        return { iconColor: '#0fff50', label: 'Connected' };
    }
    if (sseSource && !checksheet) {
        return {
            iconColor: 'yellow',
            label: '',
        };
    }
    if (!sseSource && error) {
        return { iconColor: 'orange', label: 'Click to reconnect..' };
    }
    return { iconColor: 'red', label: 'Disconnected. Try refreshing the application.' };
};

const ConnectionStatus = ({
    sseSource,
    handleReconnect,
    heartbeatActive,
    error,
    checksheet,
    workcenterCode,
}) => {
    // Local state to trigger a pulse on click
    const [clicked, setClicked] = useState(false);

    // Get both icon color and tooltip text from one function
    const { iconColor, label } = getStatusProps(sseSource, error, checksheet);

    const handleClick = () => {
        setClicked(true);
        // Clear the pulse after the animation duration (0.5s)
        setTimeout(() => setClicked(false), 500);
        if (error || !checksheet) handleReconnect();
    };

    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            {/* Display the Workcenter_Name if available */}
            <Text fontSize="xl" fontWeight="bold">
                {workcenterCode}
            </Text>
            <Tooltip
                label={label || 'Connection Health'}
                aria-label="SSE Connection Status"
            >
                <Box display="flex" alignItems="center">
                    {/* Text placed to the left of the icon */}
                    <Text mr={2} textAlign="center">
                        {label}
                    </Text>
                    <Box
                        as="button"
                        onClick={handleClick}
                        sx={{
                            animation:
                                heartbeatActive || clicked
                                    ? `${pulseAnimation} 0.5s ease-in-out`
                                    : 'none',
                        }}
                    >
                        <Zap size={32} color={iconColor} />
                    </Box>
                </Box>
            </Tooltip>
        </Box>
    );
};

export default ConnectionStatus;
