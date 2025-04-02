module.exports = {
    getXAVRequest: req => {
        const [postcodePrimaryLow, postcodeExtendedLow] = req.body.zip.includes('-')
            ? req.body.zip.split('-')
            : [req.body.zip, ''];

        return {
            XAVRequest: {
                AddressKeyFormat: {
                    ConsigneeName: req.body.customerName,
                    AddressLine: req.body.customerAddress,
                    PoliticalDivision2: req.body.city,
                    PoliticalDivision1: req.body.state,
                    PostcodePrimaryLow: postcodePrimaryLow,
                    PostcodeExtendedLow: postcodeExtendedLow,
                    Urbanization: '',
                    CountryCode: 'US',
                },
            },
        };
    },
};
