const db = require('../../../models');

const updateControlPlanLines = (existingLines, newLines) => {
    const existingLinesMap = new Map(
        existingLines.map(line => [line.specificationDescription, line]),
    );

    newLines.forEach(newLine => {
        const existingLine = existingLinesMap.get(newLine.specificationDescription);
        existingLine
            ? Object.assign(existingLine, newLine) // Update existing line
            : existingLines.push(newLine); // Add new line
    });

    return existingLines;
};

module.exports = {
    createControlPlanLine: async (req, validatedControlPlanLines) => {
        const { controlPlanHeader } = req.body;
        const { workcenter } = controlPlanHeader;

        // get the workcenter's active control plan
        const controlPlan = await db.Control_Plan.findOne({
            where: {
                Workcenter_Key: workcenter,
                Active: true,
            },
        });

        if (!controlPlan) {
            const error = new Error(
                `Control_Plan not found for Workcenter_Key: ${workcenter}.`,
            );
            error.status = 404;
            throw error;
        }

        // Find or create the Control_Plan_Line
        const [controlPlanLineRecord, created] = await db.Control_Plan_Line.findOrCreate({
            where: {
                Control_Plan_Key: controlPlan?.Control_Plan_Key,
            },
            defaults: {
                Control_Plan_Lines: validatedControlPlanLines, // Default value if creating a new record
            },
        });

        // If the record already exists, update it
        if (!created) {
            const existingLines = controlPlanLineRecord.Control_Plan_Lines;
            const updatedLines = updateControlPlanLines(
                existingLines,
                validatedControlPlanLines,
            );

            controlPlanLineRecord.Control_Plan_Lines = updatedLines;
            await controlPlanLineRecord.save();
        }

        return controlPlan;
    },
};
