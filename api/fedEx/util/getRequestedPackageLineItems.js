module.exports = {
    getRequestedPackageLineItems: (packages, serviceType, shipperNo) => {
        const freightServiceTypes = [
            'FEDEX_1_DAY_FREIGHT',
            'FEDEX_2_DAY_FREIGHT',
            'FEDEX_3_DAY_FREIGHT',
            'FEDEX_FIRST_FREIGHT',
        ];
        const groupedPackages = new Map();

        packages?.forEach(pkg => {
            const key = `${pkg.Container_Key}_${pkg.Weight}_${pkg.Length}_${pkg.Width}_${pkg.Height}_${pkg.Container_Type}`;

            if (groupedPackages.has(key)) {
                groupedPackages.get(key).groupPackageCount += 1;
                return;
            }

            const packageItem = {
                declaredValue: {
                    amount: pkg.Declared_Value,
                    currency: 'USD',
                },
                weight: {
                    value: pkg.Weight,
                    units: 'LB',
                },
                groupPackageCount: 1,
                packagingType: pkg.Packaging_Type.val,
                customerReferences: [
                    {
                        customerReferenceType: 'CUSTOMER_REFERENCE',
                        value: `Shipper No ${shipperNo}`,
                    },
                    {
                        customerReferenceType: 'P_O_NUMBER',
                        value: pkg.PO_No,
                    },
                ],
            };

            if (freightServiceTypes.includes(serviceType)) {
                // Add dimensions for freight
                packageItem.dimensions = {
                    length: pkg.Length,
                    width: pkg.Width,
                    height: pkg.Height,
                    units: 'IN',
                };
            }

            groupedPackages.set(key, packageItem);
        });

        return Array.from(groupedPackages.values());
    },
};
