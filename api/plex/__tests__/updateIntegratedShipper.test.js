const { updateIntegratedShipper } = require('../index.js');
const { handleWsReq } = require('../../../../../lib/handle-ws-req');
const { getWsReqBody } = require('../../../../../lib/get-ws-req-body');
const { serverResponse } = require('../../../../../lib/server-response');
const { normalizeError } = require('../../../../../lib/normalize-error');
const { clearConsole } = require('../../../../../lib/test-utils.js');

jest.mock('../../../../../lib/handle-ws-req');
jest.mock('../../../../../lib/get-ws-req-body');
jest.mock('../../../../../lib/server-response');
jest.mock('../../../../../lib/normalize-error');

describe('updateIntegratedShipper tests', () => {
    clearConsole();
    let req, res, next, config;

    beforeEach(() => {
        req = {
            query: {
                shipperKey: 'shipper_key',
                integratedShippingServiceKey: 'service_key',
            },
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        config = {};

        handleWsReq.mockResolvedValue({
            data: { success: true },
        });
        getWsReqBody.mockImplementation(body => body);
        serverResponse.mockImplementation((res, data) => res.json(data));
        normalizeError.mockImplementation(error => `Normalized error: ${error.message}`);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle the request and respond with the result', async () => {
        await updateIntegratedShipper(req, res, next, config);

        expect(handleWsReq).toHaveBeenCalledWith(req, '237535', {
            Shipper_Key: 'shipper_key',
            Integrated_Shipping_Service_Key: 'service_key',
        });
        expect(serverResponse).toHaveBeenCalledWith(
            res,
            {
                data: { success: true },
            },
            config,
        );
    });

    it('should handle errors correctly', async () => {
        const error = new Error('Test error');
        handleWsReq.mockRejectedValueOnce(error);

        await updateIntegratedShipper(req, res, next, config);

        expect(normalizeError).toHaveBeenCalledWith(error);
        expect(next).toHaveBeenCalledWith(error);
    });
});
