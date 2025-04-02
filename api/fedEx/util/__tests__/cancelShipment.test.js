const axios = require('axios');
const { serverResponse } = require('../../../../../../lib/server-response');
const { getToken } = require('../getToken');
const { cancelShipment } = require('../cancelShipment');
const { clearConsole } = require('../../../../../../lib/test-utils');

jest.mock('axios');
jest.mock('../../../../../../lib/server-response');
jest.mock('../../../../../../lib/normalize-error');
jest.mock('../getToken');

describe('cancelShipment tests', () => {
    clearConsole();
    let req, res, next, accountNumber, config;

    beforeEach(() => {
        req = {
            body: {
                trackingNo: '123456789012',
            },
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        accountNumber = '123456789';
        config = {};

        getToken.mockResolvedValue('mocked_token');
        axios.put.mockResolvedValue({ data: 'canceled_shipment' });
        serverResponse.mockImplementation((res, data) => res.json(data));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should cancel the shipment and respond with the result', async () => {
        await cancelShipment(req, res, next, accountNumber, config);

        expect(getToken).toHaveBeenCalledWith(req);
        expect(axios.put).toHaveBeenCalledWith(
            'https://apis.fedex.com/ship/v1/shipments/cancel',
            {
                accountNumber: {
                    value: accountNumber,
                },
                trackingNumber: '123456789012',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-locale': 'en_US',
                    Authorization: 'Bearer mocked_token',
                },
            },
        );
        expect(serverResponse).toHaveBeenCalledWith(
            res,
            { data: 'canceled_shipment' },
            config,
        );
    });
});
