const { addIntegratedShippingTrackingNo } = require('../index.js');
const { handleWsReq } = require('../../../../../lib/handle-ws-req');
const { getWsReqBody } = require('../../../../../lib/get-ws-req-body');
const { serverResponse } = require('../../../../../lib/server-response');
const { normalizeError } = require('../../../../../lib/normalize-error');
const { clearConsole } = require('../../../../../lib/test-utils.js');

jest.mock('../../../../../lib/handle-ws-req');
jest.mock('../../../../../lib/get-ws-req-body');
jest.mock('../../../../../lib/server-response');
jest.mock('../../../../../lib/normalize-error');

describe('addIntegratedShippingTrackingNo tests', () => {
    clearConsole();
    let req, res, next, config;

    beforeEach(() => {
        req = {
            query: {
                shipperKey: 'shipper_key',
            },
        };
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
        const containerKey = 'container_key';
        const trackingNo = 'tracking_no';
        const useTrackingNo = true;

        await addIntegratedShippingTrackingNo(
            req,
            res,
            next,
            containerKey,
            trackingNo,
            useTrackingNo,
            config,
        );

        expect(getWsReqBody).toHaveBeenCalledWith({
            Container_Key: containerKey,
            Shipper_Key: 'shipper_key',
            Tracking_No: trackingNo,
            Use_Tracking_No: useTrackingNo,
        });
        expect(handleWsReq).toHaveBeenCalledWith(req, '237645', {
            Container_Key: containerKey,
            Shipper_Key: 'shipper_key',
            Tracking_No: trackingNo,
            Use_Tracking_No: useTrackingNo,
        });
        expect(serverResponse).toHaveBeenCalledWith(res, 'mocked_ws_response', config);
    });

    it('should handle errors correctly', async () => {
        const containerKey = 'container_key';
        const trackingNo = 'tracking_no';
        const useTrackingNo = true;
        const error = new Error('Test error');
        handleWsReq.mockRejectedValue(error);

        await addIntegratedShippingTrackingNo(
            req,
            res,
            next,
            containerKey,
            trackingNo,
            useTrackingNo,
            config,
        );

        expect(normalizeError).toHaveBeenCalledWith(error);
        expect(next).toHaveBeenCalledWith(error);
    });
});
