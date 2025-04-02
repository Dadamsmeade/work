const axios = require('axios');

module.exports = {
    /**
     * Updates an order's status in Magento
     *
     * @param {string} baseUrl - The base URL for the Magento API
     * @param {string} orderId - The ID of the order to update
     * @param {Object} updateData - Data to update on the order
     * @param {string} updateData.status - New status to set for the order
     * @returns {Promise<Object>} Response object containing:
     *   - status: Success status of the operation
     *   - message: Description of what was updated
     *   - data: Updated order details including:
     *     - order_id: ID of the updated order
     *     - status: New status of the order
     *     - updated_at: Timestamp of the update
     * @throws {Error} When required parameters are missing or API request fails
     */
    postOrder: async (baseUrl, accessToken, orderId, updateData) => {
        if (!baseUrl) {
            throw new Error('Magento base URL is not configured');
        }

        if (!orderId) {
            throw new Error('Order ID is required for updating an order');
        }

        if (!updateData?.status) {
            throw new Error('Status update is required in updateData');
        }

        const requestPayload = {
            entity: {
                entity_id: orderId,
                status: updateData.status,
            },
        };

        const response = await axios({
            url: `${baseUrl}/rest/V1/orders`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            data: requestPayload,
        });

        if (!response.data?.entity_id) {
            throw new Error('Invalid response from Magento API');
        }

        return {
            status: 'success',
            message: `Successfully updated order ${orderId} status to ${updateData.status}`,
            data: {
                order_id: response.data.entity_id,
                status: response.data.status,
                updated_at: response.data.updated_at,
            },
        };
    },
};
