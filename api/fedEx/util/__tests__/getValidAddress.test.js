const axios = require('axios');
const { getToken } = require('../getToken');
const { getValidAddress } = require('../getValidAddress');

jest.mock('axios');
jest.mock('../getToken');

describe('getValidAddress tests', () => {
    let req;
    let addressRequest;

    beforeEach(() => {
        req = {};
        addressRequest = {};

        getToken.mockResolvedValue('mocked_token');
        axios.post.mockResolvedValue({
            data: {
                resolvedAddress: 'mocked_resolved_address',
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should retrieve the valid address successfully', async () => {
        const result = await getValidAddress(req, addressRequest);

        expect(getToken).toHaveBeenCalledWith(req);
        expect(axios.post).toHaveBeenCalledWith(
            'https://apis.fedex.com/address/v1/addresses/resolve',
            addressRequest,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-locale': 'en_US',
                    Authorization: 'Bearer mocked_token',
                },
            },
        );
        expect(result).toEqual({ resolvedAddress: 'mocked_resolved_address' });
    });

    it('should throw an error if getToken fails', async () => {
        getToken.mockRejectedValueOnce(new Error('Failed to get token'));

        await expect(getValidAddress(req, addressRequest)).rejects.toThrow(
            'Failed to get token',
        );
    });

    it('should throw an error if axios post fails', async () => {
        axios.post.mockRejectedValueOnce(new Error('Failed to resolve address'));

        await expect(getValidAddress(req, addressRequest)).rejects.toThrow(
            'Failed to resolve address',
        );
    });
});
