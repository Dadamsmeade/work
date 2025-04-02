const { magento } = require('../api');

const endpoints = {
    'import-orders': magento.importOrders,
    'set-order-statuses': magento.setOrderStatuses,
};

module.exports = {
    exec: (req, res, next) => {
        const endpoint = endpoints[req.params.type];
        return !endpoint
            ? next(new Error('Endpoint not found for: ' + req.params.type))
            : endpoint(req, res, next);
    },
};
