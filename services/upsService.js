const { ups } = require('../api');

const endpoints = {
    'validate-address': ups.validateAddress,
    'get-rate': ups.getRate,
    'void-shipment': ups.voidShipment,
    'sync-shipment': ups.syncShipment,
};

module.exports = {
    exec: (req, res, next) => {
        const endpoint = endpoints[req.params.type];
        return !endpoint
            ? next(new Error('Endpoint not found for: ' + req.params.type))
            : endpoint(req, res, next);
    },
};
