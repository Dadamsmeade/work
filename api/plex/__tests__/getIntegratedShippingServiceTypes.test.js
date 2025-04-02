const { getIntegratedShippingServiceTypes } = require('../index.js');
const { handleWsReq } = require('../../../../../lib/handle-ws-req');
const { getWsReqBody } = require('../../../../../lib/get-ws-req-body');
const { serverResponse } = require('../../../../../lib/server-response');
const { normalizeError } = require('../../../../../lib/normalize-error');
const { clearConsole } = require('../../../../../lib/test-utils.js');

jest.mock('../../../../../lib/handle-ws-req');
jest.mock('../../../../../lib/get-ws-req-body');
jest.mock('../../../../../lib/server-response');
jest.mock('../../../../../lib/normalize-error');

describe('getIntegratedShippingServiceTypes tests', () => {
    clearConsole();
    let req, res, next, config;

    beforeEach(() => {
        req = {
            query: {
                serviceType: 'service_type',
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
                { Service_Type: 'service_type_1' },
                { Service_Type: 'service_type_2' },
            ],
        });
        getWsReqBody.mockImplementation(body => body);
        serverResponse.mockImplementation((res, data) => res.json(data));
        normalizeError.mockImplementation(error => `Normalized error: ${error.message}`);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle the request and respond with the service types', async () => {
        await getIntegratedShippingServiceTypes(req, res, next, config);

        expect(handleWsReq).toHaveBeenCalledWith(req, '16349', {
            Service_Type: 'service_type',
        });
        expect(serverResponse).toHaveBeenCalledWith(
            res,
            {
                data: [
                    { Service_Type: 'service_type_1' },
                    { Service_Type: 'service_type_2' },
                ],
            },
            config,
        );
    });

    it('should handle errors correctly', async () => {
        const error = new Error('Test error');
        handleWsReq.mockRejectedValueOnce(error);

        await getIntegratedShippingServiceTypes(req, res, next, config);

        expect(normalizeError).toHaveBeenCalledWith(error);
        expect(next).toHaveBeenCalledWith(error);
    });
});
