const axios = require('axios');
const { serverResponse } = require('../../../../../lib/server-response');
const { getToken } = require('./getToken');

module.exports = {
    deleteShipment: async (req, res, config) => {
        const bearerToken = await getToken(req);
        const version = 'v2403';
        const deletedShipment = await axios({
            method: 'delete',
            url: `https://onlinetools.ups.com/api/shipments/${version}/void/cancel/${req.body.trackingNo}`,
            headers: {
                'Content-Type': 'application/json',
                transId: '',
                transactionSrc: 'production',
                Authorization: `Bearer ${bearerToken.access_token}`,
            },
        });
        return serverResponse(res, deletedShipment.data, config);
    },
};
