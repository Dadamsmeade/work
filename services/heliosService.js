const { helios } = require('../api');

const endpoints = {
    'get-control-plan': helios.getControlPlan,
    'sync-checksheet': helios.syncChecksheet,
    'update-control-plan': helios.updateControlPlan,
};

module.exports = {
    exec: (req, res, next) => {
        const endpoint = endpoints[req.params.type];
        return !endpoint
            ? next(new Error('Endpoint not found for: ' + req.params.type))
            : endpoint(req, res, next);
    },
};
