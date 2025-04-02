const { plex } = require('../api');

const endpoints = {
    'add-integrated-shipping-tracking-no': plex.addIntegratedShippingTrackingNo,
    'add-checksheet-with-measurements': plex.addChecksheetWithMeasurements,
    'get-picker-workcenters': plex.getPickerWorkcenters,
    'get-customer-address': plex.getCustomerAddress,
    'get-customer-address-building': plex.getCustomerAddressBuilding,
    'get-customer-address-integrated-shipping-provider-accounts':
        plex.getCustomerAddressIntegratedShippingProviderAccounts,
    'get-customer-address-residential-classification':
        plex.getCustomerAddressResidentialClassification,
    'get-integrated-shipping-accounts': plex.getIntegratedShippingAccounts,
    'get-integrated-shipping-packages': plex.getIntegratedShippingPackages,
    'get-integrated-shipping-services': plex.getIntegratedShippingServices,
    'get-ecommerce-parts': plex.getEcommerceParts,
    'get-shipped-containers': plex.getShippedContainers,
    'get-shipper-form': plex.getShipperForm,
    'get-shippers': plex.getShippers,
    'update-integrated-shipper': plex.updateIntegratedShipper,
    'update-integrated-shipping-customer-address':
        plex.updateIntegratedShippingCustomerAddress,
    'update-integrated-shipping-confirmation': plex.updateIntegratedShippingConfirmation,
    'update-shipper-freight': plex.updateShipperFreight,
    'update-truck': plex.updateTruck,
};

module.exports = {
    exec: (req, res, next) => {
        const endpoint = endpoints[req.params.type];
        return !endpoint
            ? next(new Error('Endpoint not found for: ' + req.params.type))
            : endpoint(req, res, next);
    },
};
