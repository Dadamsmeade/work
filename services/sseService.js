const { sse } = require('../api');

const endpoints = {
    'sse-connect': sse.sseConnect,
    'sse-disconnect': sse.sseDisconnect,
    'sse-list-clients': sse.sseListClients,
};

module.exports = {
    exec: (req, res, next) => {
        const endpoint = endpoints[req.params.type];
        return !endpoint
            ? next(new Error('Endpoint not found for: ' + req.params.type))
            : endpoint(req, res, next);
    },
};
