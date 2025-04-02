const { getIntegratedShippingServices } = require('../index.js');
const { handleWsReq } = require('../../../../../lib/handle-ws-req');
const { getWsReqBody } = require('../../../../../lib/get-ws-req-body');
const { serverResponse } = require('../../../../../lib/server-response');
const { normalizeError } = require('../../../../../lib/normalize-error');
const { clearConsole } = require('../../../../../lib/test-utils.js');

jest.mock('../../../../../lib/handle-ws-req');
jest.mock('../../../../../lib/get-ws-req-body');
jest.mock('../../../../../lib/server-response');
jest.mock('../../../../../lib/normalize-error');

describe('getIntegratedShippingServices tests', () => {
    clearConsole();
    let req, res, next, config;

    beforeEach(() => {
        req = {
            query: {
                options: JSON.stringify({
                    integratedShippingProviderTypeKeys: ['key1', 'key2'],
                }),
                carrierNo: 'carrier_no',
            },
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        config = {};

        handleWsReq.mockResolvedValue({
            data: [
                { Integrated_Shipping_Provider_Type_Key: 'key1' },
                { Integrated_Shipping_Provider_Type_Key: 'key3' },
            ],
        });
        getWsReqBody.mockImplementation(body => body);
        serverResponse.mockImplementation((res, data) => res.json(data));
        normalizeError.mockImplementation(error => `Normalized error: ${error.message}`);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle the request and respond with the filtered services', async () => {
        await getIntegratedShippingServices(req, res, next, config);

        expect(handleWsReq).toHaveBeenCalledWith(req, '236612', {
            Carrier_No: 'carrier_no',
        });
        expect(serverResponse).toHaveBeenCalledWith(
            res,
            {
                data: [{ Integrated_Shipping_Provider_Type_Key: 'key1' }],
            },
            config,
        );
    });

    it('should handle errors correctly', async () => {
        const error = new Error('Test error');
        handleWsReq.mockRejectedValueOnce(error);

        await getIntegratedShippingServices(req, res, next, config);

        expect(normalizeError).toHaveBeenCalledWith(error);
        expect(next).toHaveBeenCalledWith(error);
    });
});
