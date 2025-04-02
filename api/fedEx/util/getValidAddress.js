const axios = require('axios');
const { getToken } = require('./getToken');

module.exports = {
    getValidAddress: async (req, addressRequest) => {
        const bearerToken = await getToken(req);
        const response = await axios.post(
            'https://apis.fedex.com/address/v1/addresses/resolve',
            addressRequest,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-locale': 'en_US',
                    Authorization: `Bearer ${bearerToken}`,
                },
            },
        );
        return response.data;
    },
};
