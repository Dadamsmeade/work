const { validateAddress } = require('../index');
const { getToken } = require('../util/getToken');
const { getXAVRequest } = require('../util/getXAVRequest');
const { getValidAddress } = require('../util/getValidAddress');
const { serverResponse } = require('../../../../../lib/server-response');
const { clearConsole } = require('../../../../../lib/test-utils');

jest.mock('../util/getToken');
jest.mock('../util/getXAVRequest');
jest.mock('../util/getValidAddress');
jest.mock('../../../../../lib/server-response');

describe('validateAddress', () => {
    clearConsole();
    let req, res, next;

    beforeEach(() => {
        req = { query: {}, body: {} };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should validate address successfully', async () => {
        getToken.mockResolvedValue({ access_token: 'mock-token' });
        getXAVRequest.mockReturnValue({ mock: 'xavRequest' });
        getValidAddress.mockResolvedValue({ mock: 'validatedAddress' });
        serverResponse.mockImplementation((res, data) => data);

        const result = await validateAddress(req, res, next);
        expect(result).toEqual({ mock: 'validatedAddress' });
    });

    it('should handle errors', async () => {
        getToken.mockRejectedValue(new Error('Validation error'));
        await validateAddress(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});
