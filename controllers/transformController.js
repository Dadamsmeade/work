const {
    azureService,
    fedExService,
    heliosService,
    plexService,
    sseService,
    magentoService,
    upsService,
} = require('../services');

module.exports = {
    exec: (req, res, next) => {
        const { service } = req.params;

        switch (service) {
            case 'azure':
                azureService.exec(req, res, next);
                break;
            case 'fedEx':
                fedExService.exec(req, res, next);
                break;
            case 'helios':
                heliosService.exec(req, res, next);
                break;
            case 'plex':
                plexService.exec(req, res, next);
                break;
            case 'sse':
                sseService.exec(req, res, next);
                break;
            case 'ups':
                upsService.exec(req, res, next);
                break;
            case 'magento':
                magentoService.exec(req, res, next);
                break;
            default:
                const msg = `Service not found: ${service}`;
                console.error(msg);
                res.status(400).send(msg);
                break;
        }
    },
};
