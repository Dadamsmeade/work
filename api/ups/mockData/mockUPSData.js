const { accountNumber } = 'string';

const mockXAVRequest = {
    XAVRequest: {
        AddressKeyFormat: {
            ConsigneeName: 'RITZ CAMERA CENTERS-1749',
            BuildingName: 'Innoplex',
            AddressLine: ['26601 ALISO CREEK ROAD', 'STE D', 'ALISO VIEJO TOWN CENTER'],
            Region: 'ROSWELL,GA,30076-1521',
            PoliticalDivision2: 'ALISO VIEJO',
            PoliticalDivision1: 'CA',
            PostcodePrimaryLow: '92656',
            PostcodeExtendedLow: '1521',
            Urbanization: 'porto arundal',
            CountryCode: 'US',
        },
    },
};

const mockShipper = {
    Name: 'ShipperName',
    AttentionName: 'ShipperZs Attn Name',
    TaxIdentificationNumber: '123456',
    Phone: {
        Number: '1115554758',
        Extension: ' ',
    },
    ShipperNumber: accountNumber,
    FaxNumber: '8002222222',
    Address: {
        AddressLine: ['2311 York Rd'],
        City: 'Timonium',
        StateProvinceCode: 'MD',
        PostalCode: '21093',
        CountryCode: 'US',
    },
};

const mockShipTo = {
    Name: 'Happy Dog Pet Supply',
    AttentionName: '1160b_74',
    Phone: { Number: '9225377171' },
    Address: {
        AddressLine: ['123 Main St'],
        City: 'timonium',
        StateProvinceCode: 'MD',
        PostalCode: '21030',
        CountryCode: 'US',
    },
    Residential: ' ',
};

const mockShipFrom = {
    Name: 'T and T Designs',
    AttentionName: '1160b_74',
    Phone: { Number: '1234567890' },
    FaxNumber: '1234567890',
    Address: {
        AddressLine: ['2311 York Rd'],
        City: 'Alpharetta',
        StateProvinceCode: 'GA',
        PostalCode: '30005',
        CountryCode: 'US',
    },
};

const mockPaymentDetails = {
    ShipmentCharge: {
        Type: '01',
        BillShipper: {
            AccountNumber: accountNumber,
        },
    },
};

const mockPackage = {
    Description: ' ',
    Packaging: {
        Code: '02',
        Description: 'Nails',
    },
    Dimensions: {
        UnitOfMeasurement: {
            Code: 'IN',
            Description: 'Inches',
        },
        Length: '10',
        Width: '30',
        Height: '45',
    },
    PackageWeight: {
        UnitOfMeasurement: {
            Code: 'LBS',
            Description: 'Pounds',
        },
        Weight: '5',
    },
};

const mockSimpleRatePackage = {
    SimpleRate: {
        Description: 'SimpleRateDescription',
        Code: 'XS',
    },
    PackagingType: {
        Code: '02',
        Description: 'Packaging',
    },
    Dimensions: {
        UnitOfMeasurement: {
            Code: 'IN',
            Description: 'Inches',
        },
        Length: '5',
        Width: '5',
        Height: '5',
    },
    PackageWeight: {
        UnitOfMeasurement: {
            Code: 'LBS',
            Description: 'Pounds',
        },
        Weight: '1',
    },
};

const mockRateRequestBody = {
    RateRequest: {
        Request: {
            TransactionReference: {
                CustomerContext: 'CustomerContext',
            },
        },
        Shipment: {
            Shipper: mockShipper,
            ShipTo: mockShipTo,
            ShipFrom: mockShipFrom,
            PaymentDetails: mockPaymentDetails,
            Service: {
                Code: '03',
                Description: 'Ground',
            },
            NumOfPieces: '1',
            Package: mockSimpleRatePackage,
        },
    },
};

const mockShippingRequestBody = {
    ShipmentRequest: {
        Request: {
            SubVersion: '1801',
            RequestOption: 'nonvalidate',
            TransactionReference: { CustomerContext: '' },
        },
        Shipment: {
            Description: 'Ship WS test',
            Shipper: mockShipper,
            ShipTo: mockShipTo,
            ShipFrom: mockShipFrom,
            PaymentInformation: mockPaymentDetails,
            Service: {
                Code: '03',
                Description: 'Express',
            },
            Package: mockPackage,
        },
        LabelSpecification: {
            LabelImageFormat: {
                Code: 'GIF',
                Description: 'GIF',
            },
            HTTPUserAgent: 'Mozilla/4.5',
        },
    },
};

const mockShipmentidentificationnumber = '1ZXXXXXXXXXXXXXXXX';

const mockUPSVoidShipmentResponse_Successful = {
    VoidShipmentResponse: {
        Response: {
            ResponseStatus: {
                Code: 's',
                Description: 'string',
            },
            Alert: {
                Code: 'string',
                Description: 'string',
            },
            TransactionReference: {
                CustomerContext: 'string',
                TransactionIdentifier: 'string',
            },
        },
        SummaryResult: {
            Status: {
                Code: 's',
                Description: 'string',
            },
        },
        PackageLevelResult: [
            {
                TrackingNumber: mockShipmentidentificationnumber,
                Status: {
                    Code: 's',
                    Description: 'string',
                },
            },
        ],
    },
};

const mockUPSVoidShipmentResponse_Errors = {
    errors: [
        {
          code: "190102",
          message: "No shipment found within the allowed void period"
        },
    ],
};

module.exports = {
    mockXAVRequest,
    mockShipper,
    mockShipTo,
    mockShipFrom,
    mockPaymentDetails,
    mockSimpleRatePackage,
    mockPackage,
    mockRateRequestBody,
    mockShippingRequestBody,
    mockShipmentidentificationnumber,
    mockUPSVoidShipmentResponse_Successful,
    mockUPSVoidShipmentResponse_Errors,
};
