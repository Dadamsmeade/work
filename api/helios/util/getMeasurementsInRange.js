const { validateMeasurementKeys } = require('../validators');
const { createError } = require('./createError');

module.exports = {
    getMeasurementsInRange: (controlPlanLines, fullControlPlan) => {
        const fullPlanMap = {};
        for (const fullLine of fullControlPlan.data) {
            fullPlanMap[fullLine.Specification_Description] = fullLine;
        }

        controlPlanLines.forEach(line => {
            const fullLine = fullPlanMap[line.specificationDescription];
            if (!fullLine)
                createError(
                    `${line.specificationDescription} not found on control plan`,
                    404,
                );

            const { Lower_Limit, Upper_Limit, Tolerance_Type } = fullLine;
            line = validateMeasurementKeys(line, fullLine);

            Object.keys(line.specActualMeasurement).forEach(key => {
                const measurement = line.specActualMeasurement[key];
                const value = Number(measurement);

                let computedInRange = true; // default to `true`
                if (Tolerance_Type === 'Attribute') {
                    computedInRange = value === 1;
                }
                if (
                    Tolerance_Type !== 'Attribute' &&
                    Lower_Limit != null &&
                    Upper_Limit != null
                ) {
                    computedInRange =
                        value >= Number(Lower_Limit) && value <= Number(Upper_Limit);
                }

                line.specActualMeasurement[key] = { value, inRange: computedInRange };
            });
        });

        return controlPlanLines;
    },
};
