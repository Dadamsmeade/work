const axios = require('axios');
const { serverResponse } = require('../../../../../lib/server-response');
const { getShipmentRequest } = require('./getShipmentRequest');
const { getToken } = require('./getToken');
const { combinePackages } = require('./combinePackages');

module.exports = {
    getShipment: async (req, res, next, config = {}) => {
        const shipmentRequest = await getShipmentRequest(req, res, next, config);
        const bearerToken = await getToken(req);
        const createdShipment = await axios.post(
            'https://apis.fedex.com/ship/v1/shipments',
            shipmentRequest,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-locale': 'en_US',
                    Authorization: `Bearer ${bearerToken}`,
                },
            },
        );
        const combinedPackages = combinePackages(
            createdShipment?.data?.output?.transactionShipments?.[0],
        );

        const modifiedShipment = {
            ...createdShipment,
            data: {
                ...createdShipment.data,
                combinedPackages,
            },
        };

        return serverResponse(res, modifiedShipment, config);
    },
};
