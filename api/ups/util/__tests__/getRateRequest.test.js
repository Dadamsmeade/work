const { getRateRequest } = require('../getRateRequest');
const { getPackages } = require('../getPackages');

jest.mock('../getPackages');

describe('getRateRequest tests', () => {
    let req;
    let shipFrom;
    let serviceType;

    beforeEach(() => {
        req = {
            query: {
                selectedAccount: '12345',
            },
            body: {
                packages: [
                    {
                        Length: 10,
                        Width: 5,
                        Height: 8,
                        Weight: 2,
                        Declared_Value: 100,
                        Packaging_Type: {
                            val: '02',
                            desc: 'Box',
                        },
                    },
                ],
                customerName: 'Customer Name',
                customerAddress: '123 Customer St',
                city: 'Beverly Hills',
                state: 'CA',
                zip: '90210',
                options: {
                    isSaturdayDelivery: false,
                },
            },
        };

        shipFrom = {
            Primary_PCN_Report_Company_Name: 'Shipper Company',
            Building_Address: '123 Shipper St',
            Building_City: 'Los Angeles',
            Building_State: 'CA',
            Building_Zip: '90001',
        };

        serviceType = {
            Service_Code: '03',
            Service_Type: 'UPS Ground',
        };

        getPackages.mockReturnValue([
            {
                PackagingType: {
                    Code: '02',
                    Description: 'Box',
                },
                PackageWeight: {
                    UnitOfMeasurement: {
                        Code: 'LBS',
                        Description: 'Pounds',
                    },
                    Weight: '2',
                },
                PackageServiceOptions: {
                    DeclaredValue: {
                        Type: {
                            Code: '01',
                            Description: 'Declared Value',
                        },
                        CurrencyCode: 'USD',
                        MonetaryValue: '100',
                    },
                },
                Dimensions: {
                    UnitOfMeasurement: {
                        Code: 'IN',
                        Description: 'Inches',
                    },
                    Length: '10',
                    Width: '5',
                    Height: '8',
                },
            },
        ]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should format the rate request correctly', () => {
        const result = getRateRequest(req, shipFrom, serviceType);

        expect(result).toEqual({
            RateRequest: {
                Request: {
                    TransactionReference: {
                        CustomerContext: 'CustomerContext',
                    },
                },
                Shipment: {
                    Shipper: {
                        Name: 'Shipper Company',
                        ShipperNumber: '12345',
                        Address: {
                            AddressLine: ['123 Shipper St'],
                            City: 'Los Angeles',
                            StateProvinceCode: 'CA',
                            PostalCode: '90001',
                            CountryCode: 'US',
                        },
                    },
                    ShipTo: {
                        Name: 'Customer Name',
                        Address: {
                            AddressLine: ['123 Customer St'],
                            City: 'Beverly Hills',
                            StateProvinceCode: 'CA',
                            PostalCode: '90210',
                            CountryCode: 'US',
                        },
                        Residential: '', // assuming this is left blank for now
                    },
                    PaymentDetails: {
                        ShipmentCharge: {
                            Type: '01',
                            BillShipper: {
                                AccountNumber: '12345',
                            },
                        },
                    },
                    Service: {
                        Code: '03',
                        Description: 'UPS Ground',
                    },
                    NumOfPieces: '1', // number of packages
                    Package: [
                        {
                            PackagingType: {
                                Code: '02',
                                Description: 'Box',
                            },
                            PackageWeight: {
                                UnitOfMeasurement: {
                                    Code: 'LBS',
                                    Description: 'Pounds',
                                },
                                Weight: '2',
                            },
                            PackageServiceOptions: {
                                DeclaredValue: {
                                    Type: {
                                        Code: '01',
                                        Description: 'Declared Value',
                                    },
                                    CurrencyCode: 'USD',
                                    MonetaryValue: '100',
                                },
                            },
                            Dimensions: {
                                UnitOfMeasurement: {
                                    Code: 'IN',
                                    Description: 'Inches',
                                },
                                Length: '10',
                                Width: '5',
                                Height: '8',
                            },
                        },
                    ],
                    ShipmentServiceOptions: {
                        SaturdayDeliveryIndicator: undefined, // No Saturday delivery
                    },
                },
            },
        });

        expect(getPackages).toHaveBeenCalledWith(req, 'PackagingType');
    });
});
