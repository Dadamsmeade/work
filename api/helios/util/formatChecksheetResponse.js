module.exports = {
    formatChecksheetResponse: data =>
        data.map(row => {
            const {
                Part_Name,
                Control_Plan_Line_Note,
                Specification_No,
                Specification_Description,
                PLC_Name,
                Target,
                Lower_Limit,
                Upper_Limit,
                Tolerance_Type,
                Inspection_Mode_Description,
                Sample_Size,
                Measurement,
            } = row;

            const formattedMeasurement = Object.keys(Measurement).reduce((acc, key) => {
                acc[key] = Measurement[key].value;
                return acc;
            }, {}); // Flatten the Measurement object

            return {
                Part_Name,
                Control_Plan_Line_Note,
                Specification_No,
                Specification_Description,
                PLC_Name,
                Target,
                Lower_Limit,
                Upper_Limit,
                Tolerance_Type,
                Inspection_Mode_Description,
                Sample_Size,
                Measurement: formattedMeasurement,
            };
        }),
};
