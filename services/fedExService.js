const { fedEx } = require('../api');

const endpoints = {
    'get-rate': fedEx.getRate,
    'validate-address': fedEx.validateAddress,
    'void-shipment': fedEx.voidShipment,
    'sync-shipment': fedEx.syncShipment,
};

module.exports = {
    exec: (req, res, next) => {
        const endpoint = endpoints[req.params.type];
        return !endpoint
            ? next(new Error('Endpoint not found for: ' + req.params.type))
            : endpoint(req, res, next);
    },
};
