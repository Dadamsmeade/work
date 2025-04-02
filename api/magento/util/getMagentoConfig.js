const { getSecretByType } = require('../../../../connection/services/secretService');

/**
 * Sets up Magento configuration and authentication
 *
 * @param {Object} req - Request object
 * @returns {Promise<Object>} Configuration object containing:
 *   - accessToken: Authentication token for Magento API
 *   - baseUrl: Base URL for Magento API
 *   - fromDateStr: Date string from which to retrieve orders
 * @throws {Error} When Magento base URL is missing from configuration
 */
async function getMagentoConfig(req) {
    const accessToken = await getSecretByType(req, { Access_Token: true });
    const baseUrl = await getSecretByType(req, { Base_Url: true });
    if (!baseUrl) {
        throw new Error('Missing required Magento base URL. Please configure it in Azure Key Vault.');
    }
    const fromDateStr = req.query.fromDateStr || new Date(2025, 0, 1).toISOString();
    const toDateStr = req.query.toDateStr || new Date().toISOString();

    return { accessToken, baseUrl, fromDateStr, toDateStr };
}

module.exports = {
    getMagentoConfig
};