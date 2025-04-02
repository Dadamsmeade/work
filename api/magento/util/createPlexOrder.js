const {
    addCustomerAddress,
    addSalesOrder,
    addSalesOrderLineItem,
    getTruckTypes,
} = require('../../plex');
const { mapMagentoToPlexAddressRequest } = require('./mapMagentoToPlexAddressRequest');

module.exports = {
    /**
     * Creates a new order in Plex based on a Magento order
     *
     * Order creation workflow:
     * 1. Creating billing and shipping addresses
     * 2. Creating the order header
     * 3. Adding all line items
     *
     * @param {Object} order - Magento order object
     * @param {string} order.increment_id - Magento's order ID
     * @param {Object[]} order.items - Array of order line items
     * @param {string} order.created_at - Order creation timestamp
     * @param {string} customerCode - Customer code for Plex
     * @param {string} buildingCode - Building code for Plex
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     * @param {Function} next - Next middleware function
     * @returns {Promise<Object>} Result object containing:
     *   - Order details including:
     *   - sales_order: Created order header information
     *   - line_items: Status of each line item
     *   - addresses: Created address information
     *   - increment_id: Increment Id from Magent which is assigned to Order_No
     * @throws {Error} When line items fail to be added or other creation errors occur
     */
    createPlexOrder: async (order, customerCode, testUUID, buildingCode, req, res) => {
        const [billToRequest, shipToRequest] = [true, false].map(isBillTo =>
            mapMagentoToPlexAddressRequest(order, customerCode, buildingCode, isBillTo),
        );

        // Get common carrier truck types from Plex and find the truck with lowest sort_order
        // Needed in order to schedule shipments from the customer releases screen
        const truckTypesResponse = await getTruckTypes(1, req, res, { plain: true });
        let truckTypeKey = null;
        if (
            truckTypesResponse &&
            truckTypesResponse.data &&
            truckTypesResponse.data.length > 0
        ) {
            // Filter for common carrier truck types and sort by Sort_Order
            const commonCarrierTruckTypes = truckTypesResponse.data
                .filter(truckType => truckType.Common_Carrier === 1)
                .sort((a, b) => a.Sort_Order - b.Sort_Order);

            // Get the first (highest priority) common carrier truck type
            truckTypeKey =
                commonCarrierTruckTypes.length > 0
                    ? commonCarrierTruckTypes[0].Truck_Type_Key
                    : null;
        }

        // add the addresses first
        const [billToAdded, shipToAdded] = await Promise.all([
            addCustomerAddress(
                {
                    ...req,
                    body: billToRequest,
                },
                res,
                { plain: true },
            ),
            addCustomerAddress(
                {
                    ...req,
                    body: {
                        ...shipToRequest,
                    },
                },
                res,
                { plain: true },
            ),
        ]);

        const orderNoCustom = testUUID ? order.increment_id + '-' + testUUID : order.increment_id;

        // Add order header
        const orderHeaderResult = await addSalesOrder(
            {
                ...req,
                body: {
                    '3Tier_Order': false,
                    Customer_Code: customerCode,
                    Order_No_Custom: orderNoCustom,
                    Ship_From_Building_Code: buildingCode,
                    Bill_To_Customer_Address_Code: billToRequest.Customer_Address_Code,
                    Ship_To_Customer_Address_Code: shipToRequest.Customer_Address_Code,
                    Note: `Order placed on ${order.created_at}`,
                    Prepaid_Authorization: 'Credit Card', // Prepaid_Authorization needs to be set for McGard's PCN but it lets you use any string
                    Prepaid_Amount:
                        parseFloat(order.total_paid) > 0
                            ? parseFloat(order.total_paid)
                            : 0,
                    Tax_Amount:
                        parseFloat(order.tax_amount) > 0
                            ? parseFloat(order.tax_amount)
                            : 0,
                    Freight_Amount:
                        parseFloat(order.shipping_amount) > 0
                            ? parseFloat(order.shipping_amount)
                            : 0,
                    Freight_Terms: 'Prepaid',
                },
            },
            res,
            { plain: true },
        );

        console.log(orderHeaderResult.data.outputs);

        // Return early if adding order header returns an error
        if (orderHeaderResult?.data?.outputs?.Result_Error && orderHeaderResult?.data?.outputs?.ResultCode != 18) {
            // todo.. this is where we *likely would call to `monitor-service` in order to log the error
            return;
        }

        // add line items
        await Promise.all(
            order.items.map(async lineItem => {
                const result = await addSalesOrderLineItem(
                    {
                        ...req,
                        body: {
                            Part_No: lineItem.sku,
                            Order_No: orderNoCustom,
                            Quantity: lineItem.qty_ordered,
                            Price: lineItem.price,
                            Customer_Code: customerCode,
                            Due_Date: new Date().toISOString(),
                            '3Tier_Order': false,
                            Release_Status: 'Open',
                        },
                    },
                    res,
                    { plain: true },
                );
                console.log(result.data.outputs);

                return result;
            }),
        );

        return orderHeaderResult;
    },
};
