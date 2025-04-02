const { getPackages } = require('../getPackages');

describe('getPackages tests', () => {
    let req;

    beforeEach(() => {
        req = {
            body: {
                packages: [
                    {
                        Length: 10,
                        Width: 5,
                        Height: 8,
                        Weight: 2,
                        Declared_Value: 100,
                        Packaging_Type: {
                            val: '02', // Non-'UPS Letter' type
                            desc: 'Box',
                        },
                    },
                    {
                        Length: 15,
                        Width: 10,
                        Height: 12,
                        Weight: 5,
                        Declared_Value: 200,
                        Packaging_Type: {
                            val: '03', // Non-'UPS Letter' type
                            desc: 'Envelope',
                        },
                    },
                ],
            },
        };
    });

    it('should map the packages correctly including Packaging_Type and Dimensions', () => {
        const packagingTypeKey = 'PackagingType';
        const shipperNo = '12345'; // Adjust as per actual shipper number you want to test with

        const result = getPackages(req, packagingTypeKey, shipperNo);

        expect(result).toEqual([
            {
                [packagingTypeKey]: {
                    Code: '02', // Corresponding to the package type value
                    Description: 'Box',
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
                ReferenceNumber: [
                    { Code: 'PO', Value: undefined }, // or a valid PO number if provided in the input
                    { Code: 'DP', Value: `Shipper No ${shipperNo}` },
                ],
            },
            {
                [packagingTypeKey]: {
                    Code: '03', // Corresponding to the package type value
                    Description: 'Envelope',
                },
                Dimensions: {
                    UnitOfMeasurement: {
                        Code: 'IN',
                        Description: 'Inches',
                    },
                    Length: '15',
                    Width: '10',
                    Height: '12',
                },
                PackageWeight: {
                    UnitOfMeasurement: {
                        Code: 'LBS',
                        Description: 'Pounds',
                    },
                    Weight: '5',
                },
                PackageServiceOptions: {
                    DeclaredValue: {
                        Type: {
                            Code: '01',
                            Description: 'Declared Value',
                        },
                        CurrencyCode: 'USD',
                        MonetaryValue: '200',
                    },
                },
                ReferenceNumber: [
                    { Code: 'PO', Value: undefined }, // or a valid PO number if provided
                    { Code: 'DP', Value: `Shipper No ${shipperNo}` },
                ],
            },
        ]);
    });

    it('should handle missing optional fields, Packaging_Type, and Dimensions', () => {
        req.body.packages = [
            {
                Length: 10,
                Width: 5,
                // Height is missing
                Weight: 2,
                // Declared_Value is missing
                Packaging_Type: {
                    val: '02', // Non-'UPS Letter' type
                    desc: 'Box',
                },
            },
        ];

        const packagingTypeKey = 'PackagingType';
        const shipperNo = '12345'; // Adjust accordingly

        const result = getPackages(req, packagingTypeKey, shipperNo);

        expect(result).toEqual([
            {
                [packagingTypeKey]: {
                    Code: '02',
                    Description: 'Box',
                },
                Dimensions: {
                    UnitOfMeasurement: {
                        Code: 'IN',
                        Description: 'Inches',
                    },
                    Length: '10',
                    Width: '5',
                    Height: '0', // Default value
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
                        MonetaryValue: '0', // Default value
                    },
                },
                ReferenceNumber: [
                    { Code: 'PO', Value: undefined },
                    { Code: 'DP', Value: `Shipper No ${shipperNo}` },
                ],
            },
        ]);
    });

    it('should exclude Dimensions property when Packaging_Type is "UPS Letter"', () => {
        req.body.packages = [
            {
                Weight: 1,
                Declared_Value: 50,
                Packaging_Type: {
                    val: '01', // 'UPS Letter' type
                    desc: 'UPS Letter',
                },
            },
        ];

        const packagingTypeKey = 'PackagingType';
        const shipperNo = '12345'; // Adjust accordingly

        const result = getPackages(req, packagingTypeKey, shipperNo);

        expect(result).toEqual([
            {
                [packagingTypeKey]: {
                    Code: '01',
                    Description: 'UPS Letter',
                },
                PackageWeight: {
                    UnitOfMeasurement: {
                        Code: 'LBS',
                        Description: 'Pounds',
                    },
                    Weight: '1',
                },
                PackageServiceOptions: {
                    DeclaredValue: {
                        Type: {
                            Code: '01',
                            Description: 'Declared Value',
                        },
                        CurrencyCode: 'USD',
                        MonetaryValue: '50',
                    },
                },
                ReferenceNumber: [
                    { Code: 'PO', Value: undefined },
                    { Code: 'DP', Value: `Shipper No ${shipperNo}` },
                ],
            },
        ]);
    });

    it('should throw an error if an exception occurs', () => {
        const faultyReq = null; // this will cause an error when accessing body.packages

        expect(() => getPackages(faultyReq, 'PackagingType')).toThrow();
    });
});
