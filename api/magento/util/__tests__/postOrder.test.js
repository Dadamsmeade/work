const axios = require('axios');
const { postOrder } = require('../postOrder');

jest.mock('axios');

describe('postOrder tests', () => {
    const baseUrl = 'https://shop.test.com';
    const accessToken = 'mock-access-token';
    const orderId = '12345';
    const updateData = { status: 'plex_synced' };

    const mockSuccessResponse = {
        data: {
            entity_id: orderId,
            status: 'plex_synced',
            updated_at: '2023-01-15T12:34:56Z'
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();

        axios.mockResolvedValue(mockSuccessResponse);
    });

    it('should call Magento API with correct parameters', async () => {
        await postOrder(baseUrl, accessToken, orderId, updateData);

        expect(axios).toHaveBeenCalledWith({
            url: `${baseUrl}/rest/V1/orders`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            data: {
                entity: {
                    entity_id: orderId,
                    status: updateData.status
                }
            }
        });
    });

    it('should return a success response with order details', async () => {
        const result = await postOrder(baseUrl, accessToken, orderId, updateData);

        expect(result).toEqual({
            status: 'success',
            message: `Successfully updated order ${orderId} status to ${updateData.status}`,
            data: {
                order_id: orderId,
                status: 'plex_synced',
                updated_at: '2023-01-15T12:34:56Z'
            }
        });
    });

    it('should throw an error when baseUrl is missing', async () => {
        await expect(postOrder(null, accessToken, orderId, updateData))
            .rejects
            .toThrow('Magento base URL is not configured');
    });

    it('should throw an error when orderId is missing', async () => {
        await expect(postOrder(baseUrl, accessToken, null, updateData))
            .rejects
            .toThrow('Order ID is required for updating an order');
    });

    it('should throw an error when status is missing in updateData', async () => {
        await expect(postOrder(baseUrl, accessToken, orderId, {}))
            .rejects
            .toThrow('Status update is required in updateData');
    });

    it('should throw an error when updateData is null', async () => {
        await expect(postOrder(baseUrl, accessToken, orderId, null))
            .rejects
            .toThrow('Status update is required in updateData');
    });

    it('should throw an error when API request fails', async () => {
        const mockError = new Error('API request failed');
        axios.mockRejectedValue(mockError);

        await expect(postOrder(baseUrl, accessToken, orderId, updateData))
            .rejects
            .toThrow('API request failed');
    });

    it('should throw an error when response is missing entity_id', async () => {
        const invalidResponse = {
            data: {
                status: 'plex_synced'
            }
        };

        axios.mockResolvedValue(invalidResponse);

        await expect(postOrder(baseUrl, accessToken, orderId, updateData))
            .rejects
            .toThrow('Invalid response from Magento API');
    });

    it('should throw an error when response data is null', async () => {
        const nullResponse = { data: null };

        axios.mockResolvedValue(nullResponse);

        await expect(postOrder(baseUrl, accessToken, orderId, updateData))
            .rejects
            .toThrow('Invalid response from Magento API');
    });

    it('should handle empty string values', async () => {
        const emptyStringOrderId = '';
        const emptyStringUpdateData = { status: '' };

        await expect(postOrder(baseUrl, accessToken, emptyStringOrderId, updateData))
            .rejects
            .toThrow('Order ID is required for updating an order');

        await expect(postOrder(baseUrl, accessToken, orderId, emptyStringUpdateData))
            .rejects
            .toThrow('Status update is required in updateData');
    });
});