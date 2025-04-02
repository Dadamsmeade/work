const axios = require('axios');
const { getOrders } = require('../getOrders');

jest.mock('axios');

describe('getOrders tests', () => {
    const baseUrl = 'https://shop.test.com';
    const accessToken = 'mock-access-token';
    const fromDateStr = '2025-01-01T00:00:00Z';
    const toDateStr = '2025-01-31T23:59:59Z';
    const orderStatusExclude = 'plex_synced';

    const mockOrdersResponse = {
        data: {
            items: [
                { id: 1, status: 'processing' },
                { id: 2, status: 'pending' }
            ]
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();

        axios.mockResolvedValue(mockOrdersResponse);

        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    it('should call Magento API with correct parameters', async () => {
        await getOrders(baseUrl, accessToken, fromDateStr, toDateStr, orderStatusExclude);

        expect(axios).toHaveBeenCalledWith(expect.objectContaining({
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        }));

        const calledUrl = axios.mock.calls[0][0].url;

        expect(calledUrl).toContain(`${baseUrl}/rest/V1/orders?`);

        expect(calledUrl).toContain('searchCriteria[filterGroups][0][filters][0][field]=created_at');
        expect(calledUrl).toContain(`searchCriteria[filterGroups][0][filters][0][value]=${encodeURIComponent(fromDateStr)}`);
        expect(calledUrl).toContain('searchCriteria[filterGroups][0][filters][0][conditionType]=gteq');

        expect(calledUrl).toContain('searchCriteria[filterGroups][2][filters][0][field]=created_at');
        expect(calledUrl).toContain(`searchCriteria[filterGroups][2][filters][0][value]=${encodeURIComponent(toDateStr)}`);
        expect(calledUrl).toContain('searchCriteria[filterGroups][2][filters][0][conditionType]=lteq');

        expect(calledUrl).toContain('searchCriteria[filterGroups][1][filters][0][field]=status');
        expect(calledUrl).toContain(`searchCriteria[filterGroups][1][filters][0][value]=${orderStatusExclude}`);
        expect(calledUrl).toContain('searchCriteria[filterGroups][1][filters][0][conditionType]=neq');
    });

    it('should return the response from the Magento API', async () => {
        const result = await getOrders(baseUrl, accessToken, fromDateStr, toDateStr, orderStatusExclude);

        expect(result).toEqual(mockOrdersResponse);
        // expect(console.log).toHaveBeenCalledWith('Order count retrieved:', 2);
    });

    it('should handle API error and log details', async () => {
        const mockError = {
            message: 'API request failed',
            response: {
                status: 401,
                data: { message: 'Unauthorized' }
            }
        };

        axios.mockRejectedValue(mockError);

        await expect(getOrders(baseUrl, accessToken, fromDateStr, toDateStr, orderStatusExclude))
            .rejects.toEqual(mockError);

        expect(console.error).toHaveBeenCalledWith('Error retrieving orders:', 'API request failed');
        expect(console.error).toHaveBeenCalledWith('Response status:', 401);
        expect(console.error).toHaveBeenCalledWith('Response data:', { message: 'Unauthorized' });
    });

    it('should handle API error without response data', async () => {
        const mockError = { message: 'Network error' };

        axios.mockRejectedValue(mockError);

        await expect(getOrders(baseUrl, accessToken, fromDateStr, toDateStr, orderStatusExclude))
            .rejects.toEqual(mockError);

        expect(console.error).toHaveBeenCalledWith('Error retrieving orders:', 'Network error');
        expect(console.error).not.toHaveBeenCalledWith('Response status:', expect.anything());
        expect(console.error).not.toHaveBeenCalledWith('Response data:', expect.anything());
    });

    it('should handle empty orders response', async () => {
        const emptyResponse = {
            data: {
                items: []
            }
        };

        axios.mockResolvedValue(emptyResponse);

        const result = await getOrders(baseUrl, accessToken, fromDateStr, toDateStr, orderStatusExclude);

        expect(result).toEqual(emptyResponse);
        // expect(console.log).toHaveBeenCalledWith('Order count retrieved:', 0);
    });

    it('should handle malformed response (missing items)', async () => {
        const malformedResponse = {
            data: {}
        };

        axios.mockResolvedValue(malformedResponse);

        const result = await getOrders(baseUrl, accessToken, fromDateStr, toDateStr, orderStatusExclude);

        expect(result).toEqual(malformedResponse);
        // expect(console.log).toHaveBeenCalledWith('Order count retrieved:', 0);
    });

    it('should properly encode date strings in URL', async () => {
        const specialFromDate = '2023-01-01T00:00:00+00:00';
        const specialToDate = '2023-01-31T23:59:59+00:00';

        await getOrders(baseUrl, accessToken, specialFromDate, specialToDate, orderStatusExclude);

        const calledUrl = axios.mock.calls[0][0].url;

        expect(calledUrl).toContain(`searchCriteria[filterGroups][0][filters][0][value]=${encodeURIComponent(specialFromDate)}`);
        expect(calledUrl).toContain(`searchCriteria[filterGroups][2][filters][0][value]=${encodeURIComponent(specialToDate)}`);
    });
});