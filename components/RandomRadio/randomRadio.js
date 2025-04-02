import React, { useState } from 'react';
import { Radio, Text } from '@chakra-ui/react';

const RandomRadio = ({ row, onInputFocus, isInvalid, selectedValue }) => {
    // Initialize radioOptions only once on mount.
    const [radioOptions] = useState(() => {
        let options = [
            { value: '1', label: 'Pass' },
            { value: '0', label: 'Fail' },
        ];
        if (Math.random() < 0.5) {
            options = options.reverse();
        }
        return options;
    });

    return radioOptions.map(option => {
        // Check if this option is selected.
        const isSelected = option.value === selectedValue;
        const color = isInvalid && isSelected ? 'red' : 'inherit';

        return (
            <Radio
                key={option.value}
                value={option.value}
                bg="white"
                onClick={() => onInputFocus(row)}
                colorScheme={color}
            >
                <Text color={color}>{option.label}</Text>
            </Radio>
        );
    });
};

export default RandomRadio;
