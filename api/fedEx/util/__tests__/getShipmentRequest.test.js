const { getShipmentRequest } = require('../getShipmentRequest');
const { normalizeServiceTypeEnum } = require('../normalizeServiceTypeEnum');
const { getCustomerAddressBuilding } = require('../../../plex/index');

jest.mock('../../../plex/index', () => ({
    getCustomerAddressBuilding: jest.fn(),
}));

jest.mock('../normalizeServiceTypeEnum', () => ({
    normalizeServiceTypeEnum: jest.fn(),
}));

describe('getShipmentRequest tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            query: {
                selectedAccount: '12345',
                selectedService: 'FEDEX_GROUND',
                selectedImageType: 'PDF',
                selectedStockType: 'PAPER_LETTER',
                selectedBillingType: 'BILL_SHIPPER',
                shipperNo: '67890',
            },
            body: {
                packages: [
                    {
                        Container_Key: 'key1',
                        Weight: 10,
                        Length: 5,
                        Width: 5,
                        Height: 5,
                        Container_Type: 'Box',
                        Declared_Value: 101,
                        PO_No: 'PO12345',
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
                        PO_No: 'PO12345',
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
                        PO_No: 'PO67890',
                        Packaging_Type: {val: 'TEST_PACKAGING'},
                    },
                ],
                zip: '90210',
                customerName: 'CUST123',
                phone: '1234567890',
                customerAddress: '123 Street',
                city: 'Los Angeles',
                state: 'CA',
                options: {
                    isSaturdayDelivery: false,
                },
            },
        };
        res = {};
        next = jest.fn();

        getCustomerAddressBuilding.mockResolvedValue({
            data: [
                {
                    Building_Zip: '12345',
                    Primary_PCN_Report_Company_Name: 'Company Name',
                    PCN_Phone: '1234567890',
                    Building_City: 'City',
                    Building_State: 'State',
                    Building_Address: 'Address',
                },
            ],
        });
        normalizeServiceTypeEnum.mockReturnValue('FEDEX_GROUND');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should format the shipment request correctly', async () => {
        const result = await getShipmentRequest(req, res, next);

        expect(result).toEqual({
            labelResponseOptions: 'URL_ONLY',
            requestedShipment: {
                shipper: {
                    contact: {
                        personName: 'Company Name',
                        phoneNumber: '1234567890',
                        companyName: 'Company Name',
                    },
                    address: {
                        city: 'City',
                        stateOrProvinceCode: 'State',
                        postalCode: 12345,
                        countryCode: 'US',
                        residential: false,
                        streetLines: ['Address', ''],
                    },
                },
                recipients: [
                    {
                        contact: {
                            personName: 'CUST123',
                            phoneNumber: '1234567890',
                            companyName: 'CUST123',
                        },
                        address: {
                            city: 'Los Angeles',
                            stateOrProvinceCode: 'CA',
                            postalCode: 90210,
                            countryCode: 'US',
                            residential: false,
                            streetLines: ['123 Street', ''],
                        },
                    },
                ],
                shipDatestamp: new Date().toISOString().split('T')[0],
                totalDeclaredValue: {
                    amount: 303,
                    currency: 'USD',
                },
                serviceType: 'FEDEX_GROUND',
                packagingType: "YOUR_PACKAGING",
                pickupType: 'USE_SCHEDULED_PICKUP',
                blockInsightVisibility: false,
                shippingChargesPayment: { paymentType: 'SENDER' },
                labelSpecification: {
                    imageType: 'PDF',
                    labelStockType: 'PAPER_LETTER',
                },
                requestedPackageLineItems: [
                    {
                        customerReferences: [
                            {
                                customerReferenceType: 'CUSTOMER_REFERENCE',
                                value: 'Shipper No 67890',
                            },
                            {
                                customerReferenceType: 'P_O_NUMBER',
                                value: 'PO12345',
                            },
                        ],
                        declaredValue: {
                            amount: 101,
                            currency: 'USD',
                        },
                        groupPackageCount: 2,
                        packagingType: "TEST_PACKAGING",
                        weight: {
                            units: 'LB',
                            value: 10,
                        },
                    },
                    {
                        customerReferences: [
                            {
                                customerReferenceType: 'CUSTOMER_REFERENCE',
                                value: 'Shipper No 67890',
                            },
                            {
                                customerReferenceType: 'P_O_NUMBER',
                                value: 'PO67890',
                            },
                        ],
                        declaredValue: {
                            amount: 101,
                            currency: 'USD',
                        },
                        groupPackageCount: 1,
                        packagingType: "TEST_PACKAGING",
                        weight: {
                            units: 'LB',
                            value: 20,
                        },
                    },
                ],
                shipmentSpecialServices: undefined,
            },
            accountNumber: {
                value: '12345',
            },
        });
    });
});
