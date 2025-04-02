module.exports = {
    getAddressRequest: req => {
        return {
            addressesToValidate: [
                {
                    address: {
                        streetLines: [req.body.customerAddress, ''], // Assuming there's only one address line
                        city: req.body.city,
                        stateOrProvinceCode: req.body.state,
                        postalCode: req.body.zip,
                        countryCode: 'US',
                    },
                },
            ],
        };
    },
};
