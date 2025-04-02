const axios = require('axios');
const { serverResponse } = require('../../../../../lib/server-response');
const { getServiceType } = require('../../../../../lib/get-service-type');
const { getShipmentRequest } = require('./getShipmentRequest');
const { getToken } = require('./getToken');
const {
    getIntegratedShippingServiceTypes,
    getCustomerAddressBuilding,
} = require('../../plex');

module.exports = {
    getShipment: async (req, res, next, config = {}) => {
        const bearerToken = await getToken(req);
        const serviceTypes = await getIntegratedShippingServiceTypes(req, res, next, {
            plain: true,
        });
        const serviceType = getServiceType(serviceTypes, req.query.selectedService);
        const shipFromAddress = await getCustomerAddressBuilding(req, res, next, {
            plain: true,
        });
        const shipmentRequest = getShipmentRequest(
            req,
            shipFromAddress.data[0],
            serviceType,
        );
        const createdShipment = await axios({
            method: 'post',
            url: `https://onlinetools.ups.com/api/shipments/v2403/ship`,
            headers: {
                'Content-Type': 'application/json',
                transId: '',
                transactionSrc: 'production',
                Authorization: `Bearer ${bearerToken.access_token}`,
            },
            data: shipmentRequest,
        });
        return serverResponse(res, createdShipment, config);
    },
};
