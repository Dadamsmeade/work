const axios = require('axios');
const { serverResponse } = require('../../../../../lib/server-response');
const { getToken } = require('./getToken');

module.exports = {
    cancelShipment: async (req, res, next, accountNumber, config = {}) => {
        const bearerToken = await getToken(req);
        const canceledShipment = await axios.put(
            'https://apis.fedex.com/ship/v1/shipments/cancel',
            {
                accountNumber: {
                    value: accountNumber,
                },
                trackingNumber: req.body.trackingNo, // assume this is master tracking number
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-locale': 'en_US',
                    Authorization: `Bearer ${bearerToken}`,
                },
            },
        );
        return serverResponse(res, canceledShipment, config);
    },
};
