const { serverResponse } = require('../../../../lib/server-response');
const { normalizeError } = require('../../../../lib/normalize-error');
const { getCustomerNo } = require('../plex');
const { getOrders } = require('./util/getOrders');
const { postOrder } = require('./util/postOrder');
const { getMagentoConfig } = require('./util/getMagentoConfig');
const { getActiveBuildingCode } = require('./util/getActiveBuildingCode');
const { validateAndProcessOrder } = require('./util/validateAndProcessOrder');

/**
 * Processes an array of items using a limited number of concurrent workers.
 * @param {Array} items - Array of items to process.
 * @param {number} concurrencyLimit - Maximum number of concurrent tasks.
 * @param {Function} processFn - Function to process each item.
 * @returns {Promise<Array>} - Array of results in the same order as items.
 */
async function processWithConcurrencyLimit(items, concurrencyLimit, processFn) {
    let index = 0;
    const results = [];
    async function worker() {
        while (index < items.length) {
            const currentIndex = index++;
            results[currentIndex] = await processFn(items[currentIndex]);
        }
    }
    // Create a pool of workers.
    const workers = [];
    for (let i = 0; i < concurrencyLimit; i++) {
        workers.push(worker());
    }
    await Promise.all(workers);
    return results;
}

module.exports = {
    /**
     * Synchronizes orders from Magento to Plex
     *
     * Order synchronization workflow:
     * 1. Retrieves authentication and configuration
     * 2. Gets customer information from Plex
     * 3. Fetches non-synced orders from Magento
     * 4. Fetches active ecommerce parts from Plex
     * 4. Processes each order (validation, creation, status updates)
     * 5. Returns summary of sync results
     */
    importOrders: async (req, res, next) => {
        try {
            // Setup and validation
            const { accessToken, baseUrl, fromDateStr, toDateStr } = await getMagentoConfig(req);
            const buildingCode = await getActiveBuildingCode(req, res);

            // Get customerNo for order header creation
            const customerNo = await getCustomerNo(req, res, { plain: true });

            // Get non-synced orders from Magento
            const magentoOrdersResponse = await getOrders(
                baseUrl.value,
                accessToken.value,
                fromDateStr,
                toDateStr,
                'plex_synced',
            );

            const concurrencyLimit = 50;
            const results = await processWithConcurrencyLimit(
                magentoOrdersResponse.data.items,
                concurrencyLimit,
                order =>
                    validateAndProcessOrder(
                        order,
                        customerNo,
                        req.query.customerCode,
                        req.query.testUUID,
                        baseUrl.value,
                        buildingCode,
                        accessToken.value,
                        req,
                        res,
                    ),
            );

            const ordersProcessed = results.filter(Boolean);

            return serverResponse(res, {
                completed: ordersProcessed.length,
            });
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    // For testing/debug, will remove in production
    setOrderStatuses: async (req, res, next) => {
        try {
            if (!req.query.orderStatus)
                throw (new Error("order status missing"));

            const { accessToken, baseUrl, fromDateStr, toDateStr } = await getMagentoConfig(req);

            // Get plex-synced orders from magento
            const magentoOrdersResponse = await getOrders(
                baseUrl.value,
                accessToken.value,
                fromDateStr,
                toDateStr,
                req.query.orderStatus,
            );
            const ordersToProcess = magentoOrdersResponse.data.items;

            const processResults = await Promise.all(
                ordersToProcess.map(order =>
                    postOrder(baseUrl.value, accessToken.value, order.entity_id, {
                        status: req.query.orderStatus,
                    }),
                ),
            );

            return serverResponse(res, { 
                status: 'success',
                summary: `${ordersToProcess.length} order statuses set to '${req.query.orderStatus}'`,
                processResults,
            });
        } catch (error) {
            console.error('Error syncing orders:', error);
            console.trace(normalizeError(error));
            next(error);
        }
    },
};
