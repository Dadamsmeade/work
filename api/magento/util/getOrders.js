const axios = require('axios');
const { getSecretByType } = (module.exports = {
    /**
     * Retrieves orders from Magento API with specified filters
     *
     * @param {string} baseUrl - The base URL for the Magento API
     * @param {string} accessToken - Access token for Magento API
     * @param {string} fromDateStr - ISO date string to filter orders from (inclusive)
     * @param {string} toDateStr - ISO date string to filter orders to (inclusive)
     * @param {string} orderStatusExclude - Order status to exclude from results
     * @returns {Promise<Object>} Response object containing:
     *   - status: Success status of the request
     *   - message: Description of the operation result
     *   - data: Retrieved orders data from Magento
     * @throws {Error} When the API request fails
     */
    getOrders: async (baseUrl, accessToken, fromDateStr, toDateStr, orderStatusExclude) => {
        let queryParts = [];

        // from date filter
        queryParts.push(`searchCriteria[filterGroups][0][filters][0][field]=created_at`);
        queryParts.push(
            `searchCriteria[filterGroups][0][filters][0][value]=${encodeURIComponent(
                fromDateStr,
            )}`,
        );

        // to date filter
        queryParts.push(`searchCriteria[filterGroups][0][filters][0][conditionType]=gteq`);

        queryParts.push(`searchCriteria[filterGroups][2][filters][0][field]=created_at`);
        queryParts.push(
            `searchCriteria[filterGroups][2][filters][0][value]=${encodeURIComponent(
                toDateStr,
            )}`,
        );
        queryParts.push(`searchCriteria[filterGroups][2][filters][0][conditionType]=lteq`);

        // exclude orders with status orderStatusExclude
        queryParts.push(`searchCriteria[filterGroups][1][filters][0][field]=status`);
        queryParts.push(
            `searchCriteria[filterGroups][1][filters][0][value]=${orderStatusExclude}`,
        );
        queryParts.push(`searchCriteria[filterGroups][1][filters][0][conditionType]=neq`);

        const queryString = queryParts.join('&');

        try {
            const response = await axios({
                url: `${baseUrl}/rest/V1/orders?${queryString}`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Order count retrieved:', response.data?.items?.length || 0);
            return response;
        } catch (error) {
            console.error('Error retrieving orders:', error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            throw error;
        }
    },
});