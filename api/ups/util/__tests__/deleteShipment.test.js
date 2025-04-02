const axios = require('axios');
const { serverResponse } = require('../../../../../../lib/server-response');
const { getToken } = require('../getToken');
const { deleteShipment } = require('../deleteShipment');

jest.mock('axios');
jest.mock('../getToken', () => ({
    getToken: jest.fn(),
}));
jest.mock('../../../../../../lib/server-response', () => ({
    serverResponse: jest.fn(),
}));

describe('deleteShipment tests', () => {
    let req, res, next, config;

    beforeEach(() => {
        req = {
            body: {
                trackingNo: '1Z12345E1512345676',
            },
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        config = {};

        getToken.mockResolvedValue({ access_token: 'mocked_token' });
        axios.mockResolvedValue({ data: { success: true } });
        serverResponse.mockImplementation((res, data) => res.json(data));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete the shipment and respond with the result', async () => {
        await deleteShipment(req, res, config);

        expect(axios).toHaveBeenCalledWith({
            method: 'delete',
            url: `https://onlinetools.ups.com/api/shipments/v2403/void/cancel/1Z12345E1512345676`,
            headers: {
                'Content-Type': 'application/json',
                transId: '',
                transactionSrc: 'production',
                Authorization: 'Bearer mocked_token',
            },
        });
        expect(serverResponse).toHaveBeenCalledWith(res, { success: true }, config);
    });
});
