const { getCustomerAddressBuilding } = require('../../plex/index');
const { validatePhone } = require('../../../../../lib/validate-phone');
const { normalizeServiceTypeEnum } = require('./normalizeServiceTypeEnum');
const { getShippingChargesPayment } = require('./getShippingChargesPayment');
const { getRequestedPackageLineItems } = require('./getRequestedPackageLineItems');
const { getTotalDeclaredValue } = require('./getTotalDeclaredValue');
const { fedExServiceTypes } = require('../../../../../enums');

module.exports = {
    getShipmentRequest: async (req, res, next, config = {}) => {
        const shipDatestamp = new Date().toISOString().split('T')[0];
        const shipFromAddress = await getCustomerAddressBuilding(req, res, next, config);
        const serviceType = normalizeServiceTypeEnum(req, fedExServiceTypes);
        const requestedPackageLineItems = getRequestedPackageLineItems(
            req.body.packages,
            serviceType,
            req.query.shipperNo,
        );

        return {
            labelResponseOptions: 'URL_ONLY',
            requestedShipment: {
                shipper: {
                    contact: {
                        personName:
                            shipFromAddress.data[0].Primary_PCN_Report_Company_Name,
                        phoneNumber: validatePhone(shipFromAddress.data[0].PCN_Phone),
                        companyName:
                            shipFromAddress.data[0].Primary_PCN_Report_Company_Name,
                    },
                    address: {
                        city: shipFromAddress.data[0].Building_City,
                        stateOrProvinceCode: shipFromAddress.data[0].Building_State,
                        postalCode: parseInt(shipFromAddress.data[0].Building_Zip),
                        countryCode: 'US',
                        residential: false, // including residential causes rates to be omitted, but omitting it breaks the label url
                        streetLines: [shipFromAddress.data[0].Building_Address, ''],
                    },
                },
                recipients: [
                    {
                        contact: {
                            personName: req.body.contactNote || req.body.customerName,
                            phoneNumber: validatePhone(req.body.phone),
                            companyName: req.body.customerName,
                        },
                        address: {
                            city: req.body.city,
                            stateOrProvinceCode: req.body.state,
                            postalCode: parseInt(req.body.zip),
                            countryCode: 'US',
                            residential: false,
                            streetLines: [req.body.customerAddress, ''],
                        },
                    },
                ],
                shipDatestamp: shipDatestamp,
                totalDeclaredValue: {
                    amount: getTotalDeclaredValue(req.body.packages),
                    currency: 'USD',
                },
                serviceType: serviceType,
                packagingType: 'YOUR_PACKAGING', // or FEDEX_ENVELOPE, etc
                pickupType: 'USE_SCHEDULED_PICKUP',
                blockInsightVisibility: false,
                shippingChargesPayment: getShippingChargesPayment(req),
                labelSpecification: {
                    imageType: req.query.selectedImageType,
                    labelStockType: req.query.selectedStockType,
                },
                requestedPackageLineItems: requestedPackageLineItems,
                shipmentSpecialServices: req.body.options.isSaturdayDelivery
                    ? {
                          specialServiceTypes: ['SATURDAY_DELIVERY'],
                      }
                    : undefined, // probably break this into its own function
            },
            accountNumber: {
                value: req.query.selectedAccount,
            },
        };
    },
};
