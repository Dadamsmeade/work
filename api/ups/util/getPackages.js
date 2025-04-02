module.exports = {
    getPackages: (req, packagingTypeKey, shipperNo) => {
        return req.body.packages.map(pkg => {
            const packageObject = {
                [packagingTypeKey]: {
                    Code: pkg.Packaging_Type.val,
                    Description: pkg.Packaging_Type.desc,
                },
                PackageWeight: {
                    UnitOfMeasurement: {
                        Code: 'LBS',
                        Description: 'Pounds',
                    },
                    Weight: pkg.Weight?.toString() ?? '0',
                },
                PackageServiceOptions: {
                    DeclaredValue: {
                        Type: {
                            Code: '01', // or '02' for 'Shipper Declared Value'
                            Description: 'Declared Value', // or 'Shipper Declared Value'
                        },
                        CurrencyCode: 'USD',
                        MonetaryValue: pkg.Declared_Value?.toString() ?? '0',
                    },
                },
                ReferenceNumber: [
                    {
                        Code: 'PO',
                        Value: pkg.PO_No,
                    },
                    {
                        Code: 'DP',
                        Value: `Shipper No ${shipperNo}`,
                    },
                ],
            };

            // add the Dimensions property for non-'UPS Letter' types
            if (pkg.Packaging_Type.val !== '01') {
                packageObject.Dimensions = {
                    UnitOfMeasurement: {
                        Code: 'IN',
                        Description: 'Inches',
                    },
                    Length: pkg.Length?.toString() ?? '0',
                    Width: pkg.Width?.toString() ?? '0',
                    Height: pkg.Height?.toString() ?? '0',
                };
            }

            return packageObject;
        });
    },
};
