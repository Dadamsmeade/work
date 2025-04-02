const { getShipmentRequest } = require('../getShipmentRequest');
const { getPackages } = require('../getPackages');
const { validatePhone } = require('../../../../../../lib/validate-phone');
const { getShipmentCharge } = require('../getShipmentCharge');

jest.mock('../getPackages');
jest.mock('../../../../../../lib/validate-phone');
jest.mock('../getShipmentCharge');

describe('getShipmentRequest tests', () => {
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
                phone: '1234567890',
                contactNote: 'Customer Contact',
                options: {
                    isSaturdayDelivery: false,
                },
            },
        };

        shipFrom = {
            Primary_PCN_Report_Company_Name: 'Shipper Company',
            Building_Name: 'Shipper Building',
            PCN_Phone: '9876543210',
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

        validatePhone.mockImplementation(phone => phone); // Mock phone validation as passthrough
        getShipmentCharge.mockReturnValue({
            ShipmentChargeType: '01',
            BillShipper: {
                AccountNumber: '12345',
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should format the shipment request correctly', () => {
        const result = getShipmentRequest(req, shipFrom, serviceType);

        expect(result).toEqual({
            ShipmentRequest: {
                Shipment: {
                    Shipper: {
                        Name: 'Shipper Company',
                        AttentionName: 'Shipper Building',
                        Phone: {
                            Number: '9876543210', // from validatePhone
                        },
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
                        AttentionName: 'Customer Contact', // from contactNote
                        Phone: {
                            Number: '1234567890', // from validatePhone
                        },
                        Address: {
                            AddressLine: ['123 Customer St'],
                            City: 'Beverly Hills',
                            StateProvinceCode: 'CA',
                            PostalCode: '90210',
                            CountryCode: 'US',
                        },
                        Residential: '', // assuming this is left blank for now
                    },
                    PaymentInformation: {
                        ShipmentCharge: {
                            ShipmentChargeType: '01',
                            BillShipper: {
                                AccountNumber: '12345',
                            },
                        },
                    },
                    Service: {
                        Code: '03',
                        Description: 'UPS Ground',
                    },
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
                        LabelDelivery: {
                            LabelLinksIndicator: '',
                        },
                        SaturdayDeliveryIndicator: undefined, // No Saturday delivery
                    },
                },
                LabelSpecification: {
                    LabelImageFormat: {
                        Code: 'GIF',
                        Description: 'GIF',
                    },
                    HTTPUserAgent: 'Mozilla/4.5',
                },
            },
        });

        expect(getPackages).toHaveBeenCalledWith(req, 'Packaging', undefined);
        expect(validatePhone).toHaveBeenCalledWith('9876543210');
        expect(validatePhone).toHaveBeenCalledWith('1234567890');
        expect(getShipmentCharge).toHaveBeenCalledWith(req);
    });
});
