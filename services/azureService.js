const { azure } = require('../api');

const endpoints = {
    'storage-list-blobs': azure.storage.listBlobs,
    'storage-get-latest-blob': azure.storage.getLatestBlob,
    'storage-get-blobs-from-date': azure.storage.getBlobsFromDate,
};

module.exports = {
    exec: (req, res, next) => {
        const endpoint = endpoints[req.params.type];
        return !endpoint
            ? next(new Error('Endpoint not found for: ' + req.params.type))
            : endpoint(req, res, next);
    },
};
