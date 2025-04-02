const { getCustomerAddressIntegratedShippingProviderAccounts } = require('../index.js');
const { handleWsReq } = require('../../../../../lib/handle-ws-req');
const { getWsReqBody } = require('../../../../../lib/get-ws-req-body');
const { serverResponse } = require('../../../../../lib/server-response');
const { normalizeError } = require('../../../../../lib/normalize-error');
const { clearConsole } = require('../../../../../lib/test-utils.js');

jest.mock('../../../../../lib/handle-ws-req');
jest.mock('../../../../../lib/get-ws-req-body');
jest.mock('../../../../../lib/server-response');
jest.mock('../../../../../lib/normalize-error');

describe('getCustomerAddressIntegratedShippingProviderAccounts tests', () => {
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
        await getCustomerAddressIntegratedShippingProviderAccounts(
            req,
            res,
            next,
            config,
        );

        expect(getWsReqBody).toHaveBeenCalledWith(null);
        expect(handleWsReq).toHaveBeenCalledWith(req, '16495', null);
        expect(serverResponse).toHaveBeenCalledWith(res, 'mocked_ws_response', config);
    });

    it('should handle errors correctly', async () => {
        const error = new Error('Test error');
        handleWsReq.mockRejectedValue(error);

        await getCustomerAddressIntegratedShippingProviderAccounts(
            req,
            res,
            next,
            config,
        );

        expect(normalizeError).toHaveBeenCalledWith(error);
        expect(next).toHaveBeenCalledWith(error);
    });
});
