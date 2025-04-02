const { normalizeError } = require('../../../../../lib/normalize-error');

module.exports = {
    normalizeServiceTypeEnum: (req, serviceTypes) => {
        // since Plex FedEx service types appear outdated
        return serviceTypes[req.query.selectedService] || null;
    },
};
