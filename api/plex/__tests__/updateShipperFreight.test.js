const { updateShipperFreight } = require('../index.js');
const { handleWsReq } = require('../../../../../lib/handle-ws-req');
const { getWsReqBody } = require('../../../../../lib/get-ws-req-body');
const { serverResponse } = require('../../../../../lib/server-response');
const { normalizeError } = require('../../../../../lib/normalize-error');
const { clearConsole } = require('../../../../../lib/test-utils.js');

jest.mock('../../../../../lib/handle-ws-req');
jest.mock('../../../../../lib/get-ws-req-body');
jest.mock('../../../../../lib/server-response');
jest.mock('../../../../../lib/normalize-error');

describe('updateShipperFreight tests', () => {
    clearConsole();
    let req, res, next, config;

    beforeEach(() => {
        req = {
            query: {
                shipperKey: 'shipper_key',
                selectedBillingType: 'BILL_SHIPPER',
            },
            body: {
                trackingNo: 'tracking_no',
                actualRate: 100,
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

    it('should handle the request and respond with the result for BILL_SHIPPER', async () => {
        await updateShipperFreight(req, res, next, config);

        expect(handleWsReq).toHaveBeenCalledWith(req, '20945', {
            Shipper_Key: 'shipper_key',
            Tracking_No: 'tracking_no',
            Freight_Amount: 100,
        });
        expect(serverResponse).toHaveBeenCalledWith(
            res,
            {
                data: { success: true },
            },
            config,
        );
    });

    it('should handle the request and respond with the result for non-BILL_SHIPPER', async () => {
        req.query.selectedBillingType = 'BILL_RECEIVER';

        await updateShipperFreight(req, res, next, config);

        expect(handleWsReq).toHaveBeenCalledWith(req, '20945', {
            Shipper_Key: 'shipper_key',
            Tracking_No: 'tracking_no',
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

        await updateShipperFreight(req, res, next, config);

        expect(normalizeError).toHaveBeenCalledWith(error);
        expect(next).toHaveBeenCalledWith(error);
    });
});
