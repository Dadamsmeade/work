const { getCustomerAddressBuilding } = require('../../plex/index');
const { getRequestedPackageLineItems } = require('../util/getRequestedPackageLineItems');
const { normalizeServiceTypeEnum } = require('./normalizeServiceTypeEnum');
const { fedExServiceTypes } = require('../../../../../enums');

const getPackagingType = (packages, serviceType) => {
    if (packages.length > 1) return undefined;
    if (serviceType === 'FEDEX_GROUND') return 'YOUR_PACKAGING';
    return packages[0].Packaging_Type.val;
};

module.exports = {
    getRateRequest: async (req, res, next, config = {}) => {
        const shipFromAddress = await getCustomerAddressBuilding(req, res, next, config);
        const serviceType = normalizeServiceTypeEnum(req, fedExServiceTypes);
        const requestedPackageLineItems = getRequestedPackageLineItems(
            req.body.packages,
            serviceType,
        );

        return {
            accountNumber: {
                value: req.query.selectedAccount, // need a negative test here to prove it does not fetch a rate if an invalid account number was passed
            },
            requestedShipment: {
                shipper: {
                    address: {
                        postalCode: shipFromAddress.data[0].Building_Zip,
                        countryCode: 'US',
                    },
                },
                recipient: {
                    address: {
                        postalCode: req.body.zip,
                        countryCode: 'US',
                    },
                },
                serviceType: serviceType,
                pickupType: 'USE_SCHEDULED_PICKUP',
                rateRequestType: ['ACCOUNT'],
                requestedPackageLineItems: requestedPackageLineItems,
                packagingType: getPackagingType(req.body.packages, serviceType),
                shipmentSpecialServices: req.body.options.isSaturdayDelivery
                    ? {
                          specialServiceTypes: ['SATURDAY_DELIVERY'],
                      }
                    : undefined, // probably break this into its own function
            },
        };
    },
};
