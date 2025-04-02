const { getShipperForm } = require('../index.js');
const { handleWsReq } = require('../../../../../lib/handle-ws-req');
const { getWsReqBody } = require('../../../../../lib/get-ws-req-body');
const { serverResponse } = require('../../../../../lib/server-response');
const { normalizeError } = require('../../../../../lib/normalize-error');
const { clearConsole } = require('../../../../../lib/test-utils.js');

jest.mock('../../../../../lib/handle-ws-req');
jest.mock('../../../../../lib/get-ws-req-body');
jest.mock('../../../../../lib/server-response');
jest.mock('../../../../../lib/normalize-error');

describe('getShipperForm tests', () => {
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

        handleWsReq
            .mockResolvedValueOnce({
                data: [
                    {
                        Customer_No: 'customer_no',
                        Customer_Address_No: 'customer_address_no',
                    },
                ],
            })
            .mockResolvedValueOnce({
                data: [
                    {
                        Contact_Note: 'contact_note',
                    },
                ],
            });

        getWsReqBody.mockImplementation(body => body);
        serverResponse.mockImplementation((res, data) => res.json(data));
        normalizeError.mockImplementation(error => `Normalized error: ${error.message}`);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle the request and respond with the modified shipper form including Contact_Note', async () => {
        await getShipperForm(req, res, next, config);

        expect(handleWsReq).toHaveBeenCalledWith(req, '2068', {
            Shipper_Key: 'shipper_key',
        });
        expect(handleWsReq).toHaveBeenCalledWith(req, '2578', {
            Customer_No: 'customer_no',
            Customer_Address_No: 'customer_address_no',
        });
        expect(serverResponse).toHaveBeenCalledWith(
            res,
            {
                data: [
                    {
                        Customer_No: 'customer_no',
                        Customer_Address_No: 'customer_address_no',
                        Contact_Note: 'contact_note',
                    },
                ],
            },
            config,
        );
    });
});
