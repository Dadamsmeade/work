const { validatePhone } = require('../../../../../lib/validate-phone');
const { getPackages } = require('./getPackages');
const { getShipmentCharge } = require('./getShipmentCharge');

module.exports = {
    /**
     * Maps Plex details to UPS shipment creation request
     * @param {Object} validatedShipToAddress - Validated ship to address
     * @param {Object} shipFromAddress - Origin address
     * @returns {Object} Mapped UPS shipment request object
     */
    getShipmentRequest: (req, shipFrom, serviceType) => {
        return {
            ShipmentRequest: {
                Shipment: {
                    Shipper: {
                        Name: shipFrom.Primary_PCN_Report_Company_Name,
                        AttentionName: shipFrom.Building_Name,
                        Phone: {
                            Number: validatePhone(shipFrom.PCN_Phone),
                        },
                        ShipperNumber: req.query.selectedAccount,
                        Address: {
                            AddressLine: [shipFrom.Building_Address],
                            City: shipFrom.Building_City,
                            StateProvinceCode: shipFrom.Building_State,
                            PostalCode: shipFrom.Building_Zip,
                            CountryCode: 'US',
                        },
                    },
                    ShipTo: {
                        Name: req.body.customerName,
                        AttentionName: req.body.contactNote || req.body.customerName,
                        Phone: {
                            Number: validatePhone(req.body.phone),
                        },
                        Address: {
                            AddressLine: [req.body.customerAddress],
                            City: req.body.city,
                            StateProvinceCode: req.body.state,
                            PostalCode: req.body.zip,
                            CountryCode: 'US',
                        },
                        Residential: '', // might need to fetch this sproc like in FedEx
                    },
                    PaymentInformation: {
                        ShipmentCharge: getShipmentCharge(req),
                    },
                    Service: {
                        Code: serviceType.Service_Code,
                        Description: serviceType.Service_Type,
                    },
                    Package: getPackages(req, 'Packaging', req.query.shipperNo),
                    ShipmentServiceOptions: {
                        LabelDelivery: {
                            LabelLinksIndicator: '',
                        },
                        SaturdayDeliveryIndicator: req.body.options?.isSaturdayDelivery
                            ? ''
                            : undefined,
                    },
                },
                LabelSpecification: {
                    LabelImageFormat: {
                        Code: 'GIF', // todo, parameterize this from printing screen like FedEx
                        Description: 'GIF',
                    },
                    HTTPUserAgent: 'Mozilla/4.5',
                },
            },
        };
    },
};
