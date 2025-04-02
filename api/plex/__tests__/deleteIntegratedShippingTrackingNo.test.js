const { deleteIntegratedShippingTrackingNo } = require('../index.js');
const { handleWsReq } = require('../../../../../lib/handle-ws-req');
const { getWsReqBody } = require('../../../../../lib/get-ws-req-body');
const { serverResponse } = require('../../../../../lib/server-response');
const { normalizeError } = require('../../../../../lib/normalize-error');
const { clearConsole } = require('../../../../../lib/test-utils.js');

jest.mock('../../../../../lib/handle-ws-req');
jest.mock('../../../../../lib/get-ws-req-body');
jest.mock('../../../../../lib/server-response');
jest.mock('../../../../../lib/normalize-error');

describe('deleteIntegratedShippingTrackingNo tests', () => {
    clearConsole();
    let req, res, next, config;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        config = {};

        handleWsReq.mockResolvedValue('mocked_ws_response');
        getWsReqBody.mockImplementation(body => body);
        serverResponse.mockImplementation((res, data) => res.json(data));
        normalizeError.mockImplementation(error => `Normalized error: ${error.message}`);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle the request and respond with the result', async () => {
        const body = {
            containerKey: 'container_key',
            shipperKey: 'shipper_key',
        };

        await deleteIntegratedShippingTrackingNo(req, res, next, body, config);

        expect(getWsReqBody).toHaveBeenCalledWith({
            Container_Key: body.containerKey,
            Shipper_Key: body.shipperKey,
        });
        expect(handleWsReq).toHaveBeenCalledWith(req, '236610', {
            Container_Key: body.containerKey,
            Shipper_Key: body.shipperKey,
        });
        expect(serverResponse).toHaveBeenCalledWith(res, 'mocked_ws_response', config);
    });

    it('should handle errors correctly', async () => {
        const body = {
            containerKey: 'container_key',
            shipperKey: 'shipper_key',
        };
        const error = new Error('Test error');
        handleWsReq.mockRejectedValue(error);

        await deleteIntegratedShippingTrackingNo(req, res, next, body, config);

        expect(normalizeError).toHaveBeenCalledWith(error);
        expect(next).toHaveBeenCalledWith(error);
    });
});
