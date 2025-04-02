const axios = require('axios');
const { getValidAddress } = require('../getValidAddress');

jest.mock('axios');

describe('getValidAddress', () => {
    const mockBearerToken = { access_token: 'mock-token' };
    const mockXAVRequest = { someKey: 'someValue' };
    const mockResponse = { data: { validatedAddress: 'validated address' } };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should make a POST request to the correct UPS API endpoint', async () => {
        axios.mockResolvedValueOnce(mockResponse);
        await getValidAddress(mockBearerToken, mockXAVRequest);
        expect(axios).toHaveBeenCalledWith({
            method: 'POST',
            url: 'https://onlinetools.ups.com/api/addressvalidation/v2/1',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer mock-token',
            },
            data: mockXAVRequest,
        });
    });

    it('should return the data from the axios response', async () => {
        axios.mockResolvedValueOnce(mockResponse);
        const result = await getValidAddress(mockBearerToken, mockXAVRequest);
        expect(result).toEqual(mockResponse.data);
    });

    it('should throw an error if the axios request fails', async () => {
        const mockError = new Error('Request failed');
        axios.mockRejectedValueOnce(mockError);
        await expect(getValidAddress(mockBearerToken, mockXAVRequest)).rejects.toThrow(
            'Request failed',
        );
    });

    it('should use the correct version and requestoption in the URL', async () => {
        axios.mockResolvedValueOnce(mockResponse);
        await getValidAddress(mockBearerToken, mockXAVRequest);
        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({
                url: expect.stringContaining('/v2/1'),
            }),
        );
    });

    it('should include the bearer token in the Authorization header', async () => {
        axios.mockResolvedValueOnce(mockResponse);
        await getValidAddress({ access_token: 'different-token' }, mockXAVRequest);
        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer different-token',
                }),
            }),
        );
    });

    it('should pass the XAVRequest as the data in the axios call', async () => {
        axios.mockResolvedValueOnce(mockResponse);
        const customXAVRequest = { customKey: 'customValue' };
        await getValidAddress(mockBearerToken, customXAVRequest);
        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({
                data: customXAVRequest,
            }),
        );
    });
});