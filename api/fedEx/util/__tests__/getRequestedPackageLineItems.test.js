const { getRequestedPackageLineItems } = require('../getRequestedPackageLineItems');

describe('getRequestedPackageLineItems Tests', () => {
    it('should group packages correctly for non-freight service types', () => {
        const packages = [
            {
                Container_Key: 'key1',
                Weight: 10,
                Length: 5,
                Width: 5,
                Height: 5,
                Container_Type: 'Box',
                Declared_Value: 101,
                PO_No: 'PO12345', // Added PO_No
                Packaging_Type: {val: 'TEST_PACKAGING'},
            },
            {
                Container_Key: 'key1',
                Weight: 10,
                Length: 5,
                Width: 5,
                Height: 5,
                Container_Type: 'Box',
                Declared_Value: 101,
                PO_No: 'PO12345', // Added PO_No
                Packaging_Type: {val: 'TEST_PACKAGING'},
            },
            {
                Container_Key: 'key2',
                Weight: 20,
                Length: 10,
                Width: 10,
                Height: 10,
                Container_Type: 'Box',
                Declared_Value: 101,
                PO_No: 'PO67890', // Added PO_No
                Packaging_Type: {val: 'TEST_PACKAGING'},
            },
        ];
        const shipperNo = '12345'; // Added shipperNo

        const result = getRequestedPackageLineItems(
            packages,
            'STANDARD_OVERNIGHT',
            shipperNo,
        );

        expect(result).toEqual([
            {
                weight: { value: 10, units: 'LB' },
                groupPackageCount: 2,
                packagingType: "TEST_PACKAGING",
                declaredValue: { amount: 101, currency: 'USD' },
                customerReferences: [
                    {
                        customerReferenceType: 'CUSTOMER_REFERENCE',
                        value: 'Shipper No 12345',
                    },
                    {
                        customerReferenceType: 'P_O_NUMBER',
                        value: 'PO12345',
                    },
                ],
            },
            {
                weight: { value: 20, units: 'LB' },
                groupPackageCount: 1,
                packagingType: "TEST_PACKAGING",
                declaredValue: { amount: 101, currency: 'USD' },
                customerReferences: [
                    {
                        customerReferenceType: 'CUSTOMER_REFERENCE',
                        value: 'Shipper No 12345',
                    },
                    {
                        customerReferenceType: 'P_O_NUMBER',
                        value: 'PO67890',
                    },
                ],
            },
        ]);
    });

    it('should group packages correctly for freight service types', () => {
        const packages = [
            {
                Container_Key: 'key1',
                Weight: 10,
                Length: 5,
                Width: 5,
                Height: 5,
                Container_Type: 'Box',
                Declared_Value: 101,
                PO_No: 'PO12345', // Added PO_No
                Packaging_Type: {val: 'TEST_PACKAGING'},
            },
            {
                Container_Key: 'key1',
                Weight: 10,
                Length: 5,
                Width: 5,
                Height: 5,
                Container_Type: 'Box',
                Declared_Value: 101,
                PO_No: 'PO12345', // Added PO_No
                Packaging_Type: {val: 'TEST_PACKAGING'},
            },
            {
                Container_Key: 'key2',
                Weight: 20,
                Length: 10,
                Width: 10,
                Height: 10,
                Container_Type: 'Box',
                Declared_Value: 101,
                PO_No: 'PO67890', // Added PO_No
                Packaging_Type: {val: 'TEST_PACKAGING'},
            },
        ];
        const shipperNo = '12345'; // Added shipperNo

        const result = getRequestedPackageLineItems(
            packages,
            'FEDEX_1_DAY_FREIGHT',
            shipperNo,
        );

        expect(result).toEqual([
            {
                weight: { value: 10, units: 'LB' },
                groupPackageCount: 2,
                packagingType: "TEST_PACKAGING",
                dimensions: { length: 5, width: 5, height: 5, units: 'IN' },
                declaredValue: { amount: 101, currency: 'USD' },
                customerReferences: [
                    {
                        customerReferenceType: 'CUSTOMER_REFERENCE',
                        value: 'Shipper No 12345',
                    },
                    {
                        customerReferenceType: 'P_O_NUMBER',
                        value: 'PO12345',
                    },
                ],
            },
            {
                weight: { value: 20, units: 'LB' },
                groupPackageCount: 1,
                packagingType: "TEST_PACKAGING",
                dimensions: { length: 10, width: 10, height: 10, units: 'IN' },
                declaredValue: { amount: 101, currency: 'USD' },
                customerReferences: [
                    {
                        customerReferenceType: 'CUSTOMER_REFERENCE',
                        value: 'Shipper No 12345',
                    },
                    {
                        customerReferenceType: 'P_O_NUMBER',
                        value: 'PO67890',
                    },
                ],
            },
        ]);
    });

    it('should handle empty packages array', () => {
        const result = getRequestedPackageLineItems([], 'STANDARD_OVERNIGHT');

        expect(result).toEqual([]);
    });

    it('should handle null packages input', () => {
        const result = getRequestedPackageLineItems(null, 'STANDARD_OVERNIGHT');

        expect(result).toEqual([]);
    });

    it('should throw an error when there is an exception', () => {
        const badPackages = [
            {
                Container_Key: 'key1',
                Weight: 10,
                Length: 5,
                Width: 5,
                Height: 5,
                Container_Type: 'Box',
                Declared_Value: 101,
            },
            null, // cause err
        ];

        expect(() =>
            getRequestedPackageLineItems(badPackages, 'STANDARD_OVERNIGHT'),
        ).toThrow();
    });

    it('should group packages with different container types correctly', () => {
        const packages = [
            {
                Plex_Record_Type: 'Container',
                Container_Key: 554826736,
                Serial_No: 'S000452',
                Container_Type: 'Pallet',
                Container_Description: '',
                Length: 12,
                Width: 12,
                Height: 12,
                Weight: 3,
                Declared_Value: 101,
                PO_No: 'PO12345',
                Packaging_Type: {val: 'TEST_PACKAGING'},
            },
            {
                Plex_Record_Type: 'Container',
                Container_Key: 559976781,
                Serial_No: 'S000534',
                Container_Type: '12x12 Box',
                Container_Description: '',
                Length: 12,
                Width: 12,
                Height: 12,
                Weight: 2,
                Declared_Value: 101,
                PO_No: 'PO12345',
                Packaging_Type: {val: 'TEST_PACKAGING'},
            },
            {
                Plex_Record_Type: 'Container',
                Container_Key: 559976850,
                Serial_No: 'S000535',
                Container_Type: '12x12 Box',
                Container_Description: '',
                Length: 12,
                Width: 12,
                Height: 12,
                Weight: 2,
                Declared_Value: 101,
                PO_No: 'PO12345',
                Packaging_Type: {val: 'TEST_PACKAGING'},
            },
            {
                Plex_Record_Type: 'Container',
                Container_Key: 559976850,
                Serial_No: 'S000535',
                Container_Type: '12x12 Box',
                Container_Description: '',
                Length: 12,
                Width: 12,
                Height: 12,
                Weight: 2,
                Declared_Value: 101,
                PO_No: 'PO12345',
                Packaging_Type: {val: 'TEST_PACKAGING'},
            },
            {
                Plex_Record_Type: 'Container',
                Container_Key: 559976850,
                Serial_No: 'S000535',
                Container_Type: '12x12 Box',
                Container_Description: '',
                Length: 24,
                Width: 12,
                Height: 12,
                Weight: 2,
                Declared_Value: 101,
                PO_No: 'PO12345',
                Packaging_Type: {val: 'TEST_PACKAGING'},
            },
        ];
        const shipperNo = '12345';
        const result = getRequestedPackageLineItems(
            packages,
            'STANDARD_OVERNIGHT',
            shipperNo,
        );

        expect(result).toEqual([
            {
                weight: { value: 3, units: 'LB' },
                groupPackageCount: 1,
                packagingType: "TEST_PACKAGING",
                declaredValue: { amount: 101, currency: 'USD' },
                customerReferences: [
                    {
                        customerReferenceType: 'CUSTOMER_REFERENCE',
                        value: 'Shipper No 12345',
                    },
                    { customerReferenceType: 'P_O_NUMBER', value: 'PO12345' },
                ],
            },
            {
                weight: { value: 2, units: 'LB' },
                groupPackageCount: 1,
                packagingType: "TEST_PACKAGING",
                declaredValue: { amount: 101, currency: 'USD' },
                customerReferences: [
                    {
                        customerReferenceType: 'CUSTOMER_REFERENCE',
                        value: 'Shipper No 12345',
                    },
                    { customerReferenceType: 'P_O_NUMBER', value: 'PO12345' },
                ],
            },
            {
                weight: { value: 2, units: 'LB' },
                groupPackageCount: 2,
                packagingType: "TEST_PACKAGING",
                declaredValue: { amount: 101, currency: 'USD' },
                customerReferences: [
                    {
                        customerReferenceType: 'CUSTOMER_REFERENCE',
                        value: 'Shipper No 12345',
                    },
                    { customerReferenceType: 'P_O_NUMBER', value: 'PO12345' },
                ],
            },
            {
                weight: { value: 2, units: 'LB' },
                groupPackageCount: 1,
                packagingType: "TEST_PACKAGING",
                declaredValue: { amount: 101, currency: 'USD' },
                customerReferences: [
                    {
                        customerReferenceType: 'CUSTOMER_REFERENCE',
                        value: 'Shipper No 12345',
                    },
                    { customerReferenceType: 'P_O_NUMBER', value: 'PO12345' },
                ],
            },
        ]);
    });

    it('should group packages with same keys but different dimensions correctly', () => {
        const packages = [
            {
                Plex_Record_Type: 'Container',
                Container_Key: 554826736,
                Serial_No: 'S000452',
                Container_Type: 'Pallet',
                Container_Description: '',
                Length: 12,
                Width: 12,
                Height: 12,
                Weight: 3,
                Declared_Value: 101,
                PO_No: 'PO12345',
                Packaging_Type: {val: 'TEST_PACKAGING'},
            },
            {
                Plex_Record_Type: 'Container',
                Container_Key: 559976781,
                Serial_No: 'S000534',
                Container_Type: '12x12 Box',
                Container_Description: '',
                Length: 12,
                Width: 12,
                Height: 12,
                Weight: 2,
                Declared_Value: 101,
                PO_No: 'PO12345',
                Packaging_Type: {val: 'TEST_PACKAGING'},
            },
            {
                Plex_Record_Type: 'Container',
                Container_Key: 559976850,
                Serial_No: 'S000535',
                Container_Type: '12x12 Box',
                Container_Description: '',
                Length: 12,
                Width: 12,
                Height: 12,
                Weight: 2,
                Declared_Value: 101,
                PO_No: 'PO12345',
                Packaging_Type: {val: 'TEST_PACKAGING'},
            },
            {
                Plex_Record_Type: 'Container',
                Container_Key: 559976850,
                Serial_No: 'S000535',
                Container_Type: '12x12 Box',
                Container_Description: '',
                Length: 24,
                Width: 12,
                Height: 12,
                Weight: 2,
                Declared_Value: 101,
                PO_No: 'PO12345',
                Packaging_Type: {val: 'TEST_PACKAGING'},
            },
        ];
        const shipperNo = '12345';
        const result = getRequestedPackageLineItems(
            packages,
            'STANDARD_OVERNIGHT',
            shipperNo,
        );

        expect(result).toEqual([
            {
                weight: { value: 3, units: 'LB' },
                groupPackageCount: 1,
                packagingType: "TEST_PACKAGING",
                declaredValue: { amount: 101, currency: 'USD' },
                customerReferences: [
                    {
                        customerReferenceType: 'CUSTOMER_REFERENCE',
                        value: 'Shipper No 12345',
                    },
                    { customerReferenceType: 'P_O_NUMBER', value: 'PO12345' },
                ],
            },
            {
                weight: { value: 2, units: 'LB' },
                groupPackageCount: 1,
                packagingType: "TEST_PACKAGING",
                declaredValue: { amount: 101, currency: 'USD' },
                customerReferences: [
                    {
                        customerReferenceType: 'CUSTOMER_REFERENCE',
                        value: 'Shipper No 12345',
                    },
                    { customerReferenceType: 'P_O_NUMBER', value: 'PO12345' },
                ],
            },
            {
                weight: { value: 2, units: 'LB' },
                groupPackageCount: 1,
                packagingType: "TEST_PACKAGING",
                declaredValue: { amount: 101, currency: 'USD' },
                customerReferences: [
                    {
                        customerReferenceType: 'CUSTOMER_REFERENCE',
                        value: 'Shipper No 12345',
                    },
                    { customerReferenceType: 'P_O_NUMBER', value: 'PO12345' },
                ],
            },
            {
                weight: { value: 2, units: 'LB' },
                groupPackageCount: 1,
                packagingType: "TEST_PACKAGING",
                declaredValue: { amount: 101, currency: 'USD' },
                customerReferences: [
                    {
                        customerReferenceType: 'CUSTOMER_REFERENCE',
                        value: 'Shipper No 12345',
                    },
                    { customerReferenceType: 'P_O_NUMBER', value: 'PO12345' },
                ],
            },
        ]);
    });
});
