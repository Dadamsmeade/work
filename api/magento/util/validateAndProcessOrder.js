const { createPlexOrder } = require('./createPlexOrder');
const { postOrder } = require('./postOrder');
const { getPart } = require('../../plex/index');

const validateParts = async (order, req, res) => {
    let valid = true;

    // Validate each line item
    for (const lineItem of order.items) {
        // getPart will still return a 200 response if the part does not exist or if 'Ecommerce' is not enabled, 
        // result.data will just be an empty array so we have to send custom data to azure if we want to log missing/invalid 
        // parts. The reason we don't just validate parts at the time of line item creation and then pipe that 
        // error response to azure is because we're required to create the order header first in order to have a valid 
        // Order_No when adding line items, but we don't have a simple way to delete order headers with web service 
        // calls in Plex, so we don't want to create orders prematurely (when we don't have to) if the parts for each 
        // line item aren't validated, therefore, we need to validate parts before we create the order header.
        const result = await getPart(
            {
                ...req,
                body: {
                    partNo: lineItem.sku,
                },
            },
            res,
            { plain: true }
        );

        // Check if part exists and has Ecommerce enabled
        if (!result?.data[0]?.Ecommerce) {
            valid = false;
            console.log(`Validation failed for SKU ${lineItem.sku}: ${result?.data[0]
                ? "Part exists, but Ecommerce is not enabled"
                : "Part does not exist in Plex"}`);
            // todo.. this is where we *likely would call to `monitor-service` in order to log the 'error'
        }
    }

    // Return validation results
    return valid;
};

module.exports = {
    /**
     * Processes a single Magento order for synchronization with Plex
     *
     * Order processing workflow:
     * 1. Creates the order in Plex if all parts are valid
     * 2. Handles failed or duplicate order cases
     * 3. Updates the order status in Magento
     *
     * @param {Object} order - The Magento order to process
     * @param {Object} customerNo - Plex customer number details
     * @param {string} customerCode - Customer code for Plex
     * @param {string} baseUrl - The Magento base URL
     * @param {string} buildingCode - Building code for Plex
     * @param {Object} magentoToken - The Magento authentication token
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     * @returns {Object} Processing result with type and relevant details
     */
    validateAndProcessOrder: async (
        order,
        customerNo,
        customerCode,
        testUUID,
        baseUrl,
        buildingCode,
        accessToken,
        req,
        res,
    ) => {
        // First validate all parts
        const validationResult = await validateParts(order, req, res);

        // If validation failed, return without creating Plex order
        console.log(order.increment_id, validationResult);
        if (!validationResult)
            return;

        // Try to create order in Plex if all parts are valid
        const result = await createPlexOrder(
            order,
            customerCode,
            testUUID,
            buildingCode,
            req,
            res,
        );

        // For duplicate orders, update status and return early (fire-and-forget)
        // If for some reason, someone on the Magento site goes in and changes the status of an order
        // from 'Synced to Plex' to something else, then helios will try and create that order again in plex,
        // and it'll return an error, which is fine, but it'll keep trying to create that order every time this runs.
        // So if the order already exists in Plex, we just want to flag that order back to 'Synced to Plex' in magento.
        // There's no reason an order status should be changed on the Magento site once it's been synced, but it can be,
        // so we should probably account for that here?
        if (result?.sales_order?.data?.outputs?.ResultCode === 18) {
            postOrder(baseUrl, accessToken, order.entity_id, {
                status: 'plex_synced',
            }).catch(
                err =>
                    console.error(
                        `Failed to update duplicate order ${order.increment_id}:`,
                        err,
                    ),
                // todo.. this is where we *likely would call to `monitor-service` in order to log the error
            );
            return result;
        }

        // Don't update magento status if order wasn't successfully created in Plex
        if (result?.sales_order?.data?.outputs?.Result_Error) {
            return result;
        }

        // Update status in Magento
        postOrder(baseUrl, accessToken, order.entity_id, {
            status: 'plex_synced',
        }).catch(
            err => console.error(`Failed to update order ${order.increment_id}:`, err),
            // todo.. this is where we *likely would call to `monitor-service` in order to log the error
        );

        return result;
    },
};
