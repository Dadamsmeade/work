const { getPackages } = require('./getPackages');

module.exports = {
    /**
     * Maps Plex shipment details to UPS rate request
     * @param {Object} shipFrom - Origin address
     * @param {Object} serviceType - UPS service mapping
     * @returns {Object} Mapped UPS rate request
     */
    getRateRequest: (req, shipFrom, serviceType) => {
        return {
            RateRequest: {
                Request: {
                    TransactionReference: {
                        CustomerContext: 'CustomerContext',
                    },
                },
                Shipment: {
                    Shipper: {
                        Name: shipFrom.Primary_PCN_Report_Company_Name,
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
                        Address: {
                            AddressLine: [req.body.customerAddress],
                            City: req.body.city,
                            StateProvinceCode: req.body.state,
                            PostalCode: req.body.zip,
                            CountryCode: 'US',
                        },
                        Residential: '', // might need to fetch this sproc like in FedEx
                    },
                    PaymentDetails: {
                        ShipmentCharge: {
                            Type: '01',
                            BillShipper: {
                                AccountNumber: req.query.selectedAccount,
                            },
                        },
                    },
                    Service: {
                        Code: serviceType.Service_Code,
                        Description: serviceType.Service_Type,
                    },
                    NumOfPieces: req.body.packages.length.toString(),
                    Package: getPackages(req, 'PackagingType'),
                    ShipmentServiceOptions: {
                        SaturdayDeliveryIndicator: req.body.options?.isSaturdayDelivery
                            ? ''
                            : undefined,
                    },
                },
            },
        };
    },
};
