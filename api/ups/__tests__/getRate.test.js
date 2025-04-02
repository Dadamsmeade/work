const axios = require('axios');
const { getRate } = require('../index');
const { getToken } = require('../util/getToken');
const { getServiceType } = require('../../../../../lib/get-service-type');
const { getCustomerAddressBuilding } = require('../../plex');
const { getRateRequest } = require('../util/getRateRequest');
const { serverResponse } = require('../../../../../lib/server-response');
const { clearConsole } = require('../../../../../lib/test-utils');

jest.mock('axios');
jest.mock('../util/getToken');
jest.mock('../../../../../lib/get-service-type');
jest.mock('../../plex');
jest.mock('../util/getRateRequest');
jest.mock('../../../../../lib/server-response');

describe('getRate', () => {
    clearConsole();
    let req, res, next;

    beforeEach(() => {
        req = { query: {}, body: {} };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should get rate successfully', async () => {
        getToken.mockResolvedValue({ access_token: 'mock-token' });
        getServiceType.mockReturnValue({ Service_Code: '03', Service_Type: 'Ground' });
        getCustomerAddressBuilding.mockResolvedValue({ data: [{ mock: 'address' }] });
        getRateRequest.mockReturnValue({ mock: 'request' });
        axios.mockResolvedValue({ data: { mock: 'rate' } });
        serverResponse.mockImplementation((res, data) => data);

        const result = await getRate(req, res, next);

        expect(result).toEqual({ mock: 'rate' });
        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'POST',
                url: 'https://onlinetools.ups.com/api/rating/v2403/Rate',
                headers: expect.objectContaining({
                    Authorization: 'Bearer mock-token',
                }),
                data: { mock: 'request' },
            }),
        );
    });

    it('should handle errors', async () => {
        getToken.mockRejectedValue(new Error('Token error'));
        await getRate(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});
