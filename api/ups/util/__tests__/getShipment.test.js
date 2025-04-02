const axios = require('axios');
const { serverResponse } = require('../../../../../../lib/server-response');
const { getServiceType } = require('../../../../../../lib/get-service-type');
const { getShipmentRequest } = require('../getShipmentRequest');
const { getToken } = require('../getToken');
const {
    getIntegratedShippingServiceTypes,
    getCustomerAddressBuilding,
} = require('../../../plex');
const { getShipment } = require('../getShipment');
const { clearConsole } = require('../../../../../../lib/test-utils');

jest.mock('axios');
jest.mock('../../../../../../lib/normalize-error');
jest.mock('../../../../../../lib/server-response');
jest.mock('../../../../../../lib/get-service-type');
jest.mock('../getShipmentRequest');
jest.mock('../getToken');
jest.mock('../../../plex', () => ({
    getIntegratedShippingServiceTypes: jest.fn(),
    getCustomerAddressBuilding: jest.fn(),
}));

describe('getShipment tests', () => {
    clearConsole();
    let req, res, next, config;

    beforeEach(() => {
        req = {
            query: {
                selectedService: 'Service123',
            },
            body: {},
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        config = {};

        getToken.mockResolvedValue({ access_token: 'mocked_token' });
        getIntegratedShippingServiceTypes.mockResolvedValue({ data: 'serviceTypes' });
        getServiceType.mockReturnValue('mocked_service_type');
        getCustomerAddressBuilding.mockResolvedValue({
            data: [{ address: 'mocked_address' }],
        });
        getShipmentRequest.mockReturnValue('mocked_shipment_request');
        axios.mockResolvedValue({ data: 'created_shipment' });
        serverResponse.mockImplementation((res, data) => res.json(data));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create the shipment and respond with the result', async () => {
        await getShipment(req, res, next, config);

        expect(getIntegratedShippingServiceTypes).toHaveBeenCalledWith(req, res, next, {
            plain: true,
        });
        expect(getServiceType).toHaveBeenCalledWith(
            { data: 'serviceTypes' },
            'Service123',
        );
        expect(getCustomerAddressBuilding).toHaveBeenCalledWith(req, res, next, {
            plain: true,
        });
        expect(getShipmentRequest).toHaveBeenCalledWith(
            req,
            { address: 'mocked_address' },
            'mocked_service_type',
        );
        expect(axios).toHaveBeenCalledWith({
            method: 'post',
            url: `https://onlinetools.ups.com/api/shipments/v2403/ship`,
            headers: {
                'Content-Type': 'application/json',
                transId: '',
                transactionSrc: 'production',
                Authorization: 'Bearer mocked_token',
            },
            data: 'mocked_shipment_request',
        });
        expect(serverResponse).toHaveBeenCalledWith(
            res,
            { data: 'created_shipment' },
            config,
        );
    });
});
