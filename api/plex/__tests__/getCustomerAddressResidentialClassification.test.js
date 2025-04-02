const { getCustomerAddressResidentialClassification } = require('../index.js');
const { handleWsReq } = require('../../../../../lib/handle-ws-req');
const { getWsReqBody } = require('../../../../../lib/get-ws-req-body');
const { serverResponse } = require('../../../../../lib/server-response');
const { normalizeError } = require('../../../../../lib/normalize-error');
const { clearConsole } = require('../../../../../lib/test-utils.js');

jest.mock('../../../../../lib/handle-ws-req');
jest.mock('../../../../../lib/get-ws-req-body');
jest.mock('../../../../../lib/server-response');
jest.mock('../../../../../lib/normalize-error');

describe('getCustomerAddressResidentialClassification tests', () => {
    clearConsole();
    let req, res, next;

    beforeEach(() => {
        req = {
            query: {
                customerNo: 'customer_no',
                customerAddressNo: 'customer_address_no',
            },
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();

        handleWsReq.mockResolvedValue({ data: [{ Residential: true }] });
        getWsReqBody.mockImplementation(body => body);
        serverResponse.mockImplementation((res, data) => res.json(data));
        normalizeError.mockImplementation(error => `Normalized error: ${error.message}`);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle the request and respond with the residential classification', async () => {
        await getCustomerAddressResidentialClassification(req, res, next);

        expect(getWsReqBody).toHaveBeenCalledWith({
            Customer_No: 'customer_no',
            Customer_Address_No: 'customer_address_no',
        });
        expect(handleWsReq).toHaveBeenCalledWith(req, '28', {
            Customer_No: 'customer_no',
            Customer_Address_No: 'customer_address_no',
        });
        expect(serverResponse).toHaveBeenCalledWith(res, true);
    });

    it('should return 400 if address has errors', async () => {
        handleWsReq.mockResolvedValueOnce({ errors: ['Some error'] });

        await getCustomerAddressResidentialClassification(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ errors: ['Some error'] });
    });

    it('should throw an error if address is not found', async () => {
        handleWsReq.mockResolvedValueOnce(null);

        await getCustomerAddressResidentialClassification(req, res, next);

        expect(normalizeError).toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle errors correctly', async () => {
        const error = new Error('Test error');
        handleWsReq.mockRejectedValue(error);

        await getCustomerAddressResidentialClassification(req, res, next);

        expect(normalizeError).toHaveBeenCalledWith(error);
        expect(next).toHaveBeenCalledWith(error);
    });
});
