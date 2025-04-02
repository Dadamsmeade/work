const { createError } = require('../util/createError');

module.exports = {
    validateControlPlan: controlPlan => {
        try {
            if (!controlPlan) {
                createError(
                    'Control plan is missing',
                    400,
                    'Invalid control plan input provided.',
                );
            }

            if (
                !controlPlan.data ||
                !Array.isArray(controlPlan.data) ||
                controlPlan.data.length === 0
            ) {
                createError(
                    'Error fetching control plan from Plex',
                    404,
                    'Check for invalid keys or missing data in Plex.',
                );
            }

            // Check for required PLC_Name on specification
            const specsMissingPLCname = controlPlan?.data
                .filter(line => {
                    return !line.PLC_Name || line.PLC_Name.trim() === '';
                })
                .map(line => ({
                    Specification_No: line.Specification_No,
                    Part_Name: line.Part_Name,
                    Part_No: line.Part_No,
                    Spec_Name: line?.PLC_Name, // UX alias for PLC_Name on Part Specification record
                }));

            if (specsMissingPLCname.length) {
                createError(
                    'Part Specification requires Spec_Name',
                    422,
                    specsMissingPLCname,
                );
            }

            return controlPlan;
        } catch (error) {
            throw error;
        }
    },

    validateMeasurementKeys: (line, fullLine) => {
        try {
            // Ensure that both line and fullLine are provided and are objects.
            if (
                !line ||
                typeof line !== 'object' ||
                !fullLine ||
                typeof fullLine !== 'object'
            ) {
                createError(
                    'Invalid input',
                    400,
                    'Line and fullLine must be provided as objects.',
                );
            }

            const { Sample_Size, Tolerance_Type } = fullLine;
            const { specActualMeasurement, specificationDescription } = line;

            // Check that specActualMeasurement exists and is a non-null object.
            if (
                typeof specActualMeasurement !== 'object' ||
                specActualMeasurement === null
            ) {
                createError(
                    `Invalid specActualMeasurement structure for specificationDescription: ${
                        specificationDescription || 'Unknown'
                    }`,
                    400,
                    'specActualMeasurement should be an object.',
                );
            }

            const measurementKeys = Object.keys(specActualMeasurement);

            if (measurementKeys.length === 0) {
                createError(
                    `Invalid specActualMeasurement key for specificationDescription: ${
                        specificationDescription || 'Unknown'
                    }`,
                    400,
                    'Measurement keys missing',
                );
            }

            // Handle non-boolean integers on Tolerance_Type "Attribute"
            if (Tolerance_Type === 'Attribute') {
                Object.entries(specActualMeasurement)
                    .filter(([, value]) => value !== 0 && value !== 1)
                    .forEach(([, value]) =>
                        createError(
                            `Invalid specActualMeasurement value for specificationDescription: ${
                                specificationDescription || 'Unknown'
                            }`,
                            400,
                            `${value} is not permitted for type boolean`,
                        ),
                    );
            }

            // For Tolerance_Type "Attribute", only one measurement key should be present.
            if (Tolerance_Type === 'Attribute' && measurementKeys.length > 1) {
                createError(
                    `Invalid specActualMeasurement key for specificationDescription: ${
                        specificationDescription || 'Unknown'
                    }`,
                    422,
                    `For null Sample_Size, expected only the key '0', but got keys: '${measurementKeys.join(
                        ', ',
                    )}'`,
                );
            }

            // Check if there are more keys than expected based on Sample_Size.
            if (
                Sample_Size !== null &&
                typeof Sample_Size === 'number' &&
                measurementKeys.length > Sample_Size
            ) {
                createError(
                    `Invalid specActualMeasurement key for specificationDescription: ${
                        specificationDescription || 'Unknown'
                    }`,
                    422,
                    `Expected specActualMeasurement keys to equal Sample_Size of ${Sample_Size}`,
                );
            }

            // For a Sample_Size of 1 or null, ensure only the key '0' is present.
            if (
                (Sample_Size === 1 || Sample_Size === null) &&
                (measurementKeys.length !== 1 || measurementKeys[0] !== '0')
            ) {
                createError(
                    `Invalid specActualMeasurement key for specificationDescription: ${
                        specificationDescription || 'Unknown'
                    }`,
                    422,
                    `For Sample_Size of ${Sample_Size}, expected only the key '0', but got keys: '${measurementKeys.join(
                        ', ',
                    )}'`,
                );
            }

            return line;
        } catch (error) {
            throw error;
        }
    },
};
