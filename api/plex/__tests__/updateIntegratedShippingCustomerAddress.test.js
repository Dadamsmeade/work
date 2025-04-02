const { updateIntegratedShippingCustomerAddress } = require('../index.js');
const { handleWsReq } = require('../../../../../lib/handle-ws-req');
const { getWsReqBody } = require('../../../../../lib/get-ws-req-body');
const { serverResponse } = require('../../../../../lib/server-response');
const { normalizeError } = require('../../../../../lib/normalize-error');
const {
    formatCustomerAddressBody,
} = require('../../../../../lib/format-customer-address-body.js');
const { clearConsole } = require('../../../../../lib/test-utils.js');

jest.mock('../../../../../lib/handle-ws-req');
jest.mock('../../../../../lib/get-ws-req-body');
jest.mock('../../../../../lib/server-response');
jest.mock('../../../../../lib/normalize-error');
jest.mock('../../../../../lib/format-customer-address-body');

describe('updateIntegratedShippingCustomerAddress tests', () => {
    clearConsole();
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                address: '123 Main St',
            },
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();

        formatCustomerAddressBody.mockResolvedValue({
            formattedAddress: 'formatted_address',
        });

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
        await updateIntegratedShippingCustomerAddress(req, res, next);

        expect(formatCustomerAddressBody).toHaveBeenCalledWith(req);
        expect(handleWsReq).toHaveBeenCalledWith(req, '236613', {
            formattedAddress: 'formatted_address',
        });
        expect(serverResponse).toHaveBeenCalledWith(res, {
            data: { success: true },
        });
    });

    it('should handle errors correctly', async () => {
        const error = new Error('Test error');
        handleWsReq.mockRejectedValueOnce(error);

        await updateIntegratedShippingCustomerAddress(req, res, next);

        expect(normalizeError).toHaveBeenCalledWith(error);
        expect(next).toHaveBeenCalledWith(error);
    });
});
