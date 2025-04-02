const { getRateRequest } = require('../getRateRequest');
const { getCustomerAddressBuilding } = require('../../../plex/index');
const { normalizeServiceTypeEnum } = require('../normalizeServiceTypeEnum');
const { fedExServiceTypes } = require('../../../../../../enums');

jest.mock('../../../plex/index', () => ({
    getCustomerAddressBuilding: jest.fn(),
}));

jest.mock('../normalizeServiceTypeEnum', () => ({
    normalizeServiceTypeEnum: jest.fn(),
}));

describe('getRateRequest tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            query: {
                selectedAccount: '12345',
                selectedService: 'FEDEX_GROUND',
            },
            body: {
                packages: [],
                zip: '90210',
                options: {
                    isSaturdayDelivery: false,
                },
            },
        };
        res = {};
        next = jest.fn();

        getCustomerAddressBuilding.mockResolvedValue({
            data: [{ Building_Zip: '12345' }],
        });
        normalizeServiceTypeEnum.mockReturnValue('FEDEX_GROUND');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should format the rate request correctly', async () => {
        const result = await getRateRequest(req, res, next);

        expect(result).toEqual({
            accountNumber: {
                value: '12345',
            },
            requestedShipment: {
                shipper: {
                    address: {
                        postalCode: '12345',
                        countryCode: 'US',
                    },
                },
                recipient: {
                    address: {
                        postalCode: '90210',
                        countryCode: 'US',
                    },
                },
                serviceType: 'FEDEX_GROUND',
                pickupType: 'USE_SCHEDULED_PICKUP',
                rateRequestType: ['ACCOUNT'],
                requestedPackageLineItems: [],
                packagingType: 'YOUR_PACKAGING',
                shipmentSpecialServices: undefined,
            },
        });
        expect(getCustomerAddressBuilding).toHaveBeenCalledWith(req, res, next, {});
        expect(normalizeServiceTypeEnum).toHaveBeenCalledWith(req, fedExServiceTypes);
    });
});
