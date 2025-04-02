const {
    addCustomerAddress,
    addSalesOrder,
    addSalesOrderLineItem,
    getTruckTypes,
} = require('../../../plex');
const { mapMagentoToPlexAddressRequest } = require('../mapMagentoToPlexAddressRequest');
const { createPlexOrder } = require('../createPlexOrder');

jest.mock('../../../plex', () => ({
    addCustomerAddress: jest.fn(),
    addSalesOrder: jest.fn(),
    addSalesOrderLineItem: jest.fn(),
    getTruckTypes: jest.fn(),
}));

jest.mock('../mapMagentoToPlexAddressRequest', () => ({
    mapMagentoToPlexAddressRequest: jest.fn(),
}));

describe('createPlexOrder tests', () => {
    let order;
    let customerCode;
    let testUUID;  // Added testUUID parameter
    let buildingCode;
    let req;
    let res;
    let billToRequest;
    let shipToRequest;

    beforeEach(() => {
        order = {
            increment_id: '10000043251',
            created_at: '2025-01-15T12:00:00Z',
            items: [
                { sku: '5432', qty_ordered: 2, price: 29.99 },
                { sku: '6344', qty_ordered: 1, price: 49.99 }
            ],
            total_paid: 109.97,
            tax_amount: 8.8,
            shipping_amount: 12.99,
            billing_address: {},
            extension_attributes: {
                shipping_assignments: [{ shipping: { address: {} } }]
            }
        };

        customerCode = 'CustomerCode';
        testUUID = 'test-uuid-123';  // Initialize testUUID
        buildingCode = 'TestBuilding';
        req = { query: {} };
        res = { status: jest.fn(() => res), json: jest.fn() };

        billToRequest = {
            Customer_Address_Code: 'Bill To Address',
        };

        shipToRequest = {
            Customer_Address_Code: 'Ship To Address',
        };

        // Updated to match new parameter order
        mapMagentoToPlexAddressRequest
            .mockImplementation((order, customerCode, buildingCode, isBillTo) => {
                return isBillTo ? billToRequest : shipToRequest;
            });

        getTruckTypes.mockResolvedValue({
            data: [
                { Truck_Type_Key: 'TRUCK1', Common_Carrier: 1, Sort_Order: 10 },
                { Truck_Type_Key: 'TRUCK2', Common_Carrier: 1, Sort_Order: 20 },
                { Truck_Type_Key: 'TRUCK3', Common_Carrier: 0, Sort_Order: 5 }
            ]
        });

        addCustomerAddress.mockResolvedValue({ data: { success: true } });

        addSalesOrder.mockResolvedValue({
            data: {
                outputs: {
                    Result_Error: null
                }
            }
        });

        addSalesOrderLineItem.mockResolvedValue({
            data: {
                outputs: {
                    Result_Error: null
                }
            }
        });

        jest.clearAllMocks();

        jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    it('should create an order with addresses, header, and line items', async () => {
        await createPlexOrder(order, customerCode, testUUID, buildingCode, req, res);

        // Expected order number with UUID
        const expectedOrderNo = `${order.increment_id}-${testUUID}`;

        // Verify mapMagentoToPlexAddressRequest called with correct parameters
        expect(mapMagentoToPlexAddressRequest).toHaveBeenCalledTimes(2);
        expect(mapMagentoToPlexAddressRequest).toHaveBeenCalledWith(order, customerCode, buildingCode, true); // Bill To
        expect(mapMagentoToPlexAddressRequest).toHaveBeenCalledWith(order, customerCode, buildingCode, false); // Ship To

        expect(getTruckTypes).toHaveBeenCalledWith(1, req, res, { plain: true });

        expect(addCustomerAddress).toHaveBeenCalledTimes(2);

        expect(addCustomerAddress).toHaveBeenCalledWith(
            expect.objectContaining({
                body: billToRequest
            }),
            res,
            { plain: true }
        );

        // No Truck_Type_Key in shipToRequest anymore
        expect(addCustomerAddress).toHaveBeenCalledWith(
            expect.objectContaining({
                body: shipToRequest
            }),
            res,
            { plain: true }
        );

        expect(addSalesOrder).toHaveBeenCalledWith(
            expect.objectContaining({
                body: expect.objectContaining({
                    '3Tier_Order': false,
                    Customer_Code: customerCode,
                    Order_No_Custom: expectedOrderNo,  // Updated to include UUID
                    Ship_From_Building_Code: buildingCode,
                    Bill_To_Customer_Address_Code: billToRequest.Customer_Address_Code,
                    Ship_To_Customer_Address_Code: shipToRequest.Customer_Address_Code,
                    Note: `Order placed on ${order.created_at}`,
                    Prepaid_Authorization: 'Credit Card',
                    Prepaid_Amount: 109.97,
                    Tax_Amount: 8.8,
                    Freight_Amount: 12.99,
                    Freight_Terms: 'Prepaid'
                })
            }),
            res,
            { plain: true }
        );

        expect(addSalesOrderLineItem).toHaveBeenCalledTimes(2);

        expect(addSalesOrderLineItem).toHaveBeenCalledWith(
            expect.objectContaining({
                body: expect.objectContaining({
                    Part_No: '5432',
                    Order_No: expectedOrderNo,  // Updated to include UUID
                    Quantity: 2,
                    Price: 29.99,
                    Customer_Code: customerCode,
                    '3Tier_Order': false,
                    Release_Status: 'Open',
                })
            }),
            res,
            { plain: true }
        );

        expect(addSalesOrderLineItem).toHaveBeenCalledWith(
            expect.objectContaining({
                body: expect.objectContaining({
                    Part_No: '6344',
                    Order_No: expectedOrderNo,  // Updated to include UUID
                    Quantity: 1,
                    Price: 49.99,
                    Customer_Code: customerCode,
                    '3Tier_Order': false,
                    Release_Status: 'Open',
                })
            }),
            res,
            { plain: true }
        );
    });

    it('should handle when testUUID is not provided', async () => {
        // Set testUUID to null
        testUUID = null;
        
        await createPlexOrder(order, customerCode, testUUID, buildingCode, req, res);

        // Order number should be original without UUID
        const expectedOrderNo = order.increment_id;

        expect(addSalesOrder).toHaveBeenCalledWith(
            expect.objectContaining({
                body: expect.objectContaining({
                    Order_No_Custom: expectedOrderNo,
                })
            }),
            res,
            { plain: true }
        );

        expect(addSalesOrderLineItem).toHaveBeenCalledWith(
            expect.objectContaining({
                body: expect.objectContaining({
                    Order_No: expectedOrderNo,
                })
            }),
            res,
            { plain: true }
        );
    });

    it('should handle when no truck types are returned', async () => {
        getTruckTypes.mockResolvedValue({ data: [] });

        await createPlexOrder(order, customerCode, testUUID, buildingCode, req, res);

        // Truck_Type_Key is no longer added to the shipToRequest
        expect(addCustomerAddress).toHaveBeenCalledWith(
            expect.objectContaining({
                body: shipToRequest
            }),
            res,
            { plain: true }
        );
    });

    it('should handle when no common carrier truck types exist', async () => {
        getTruckTypes.mockResolvedValue({
            data: [
                { Truck_Type_Key: 'TRUCK1', Common_Carrier: 0, Sort_Order: 10 },
                { Truck_Type_Key: 'TRUCK2', Common_Carrier: 0, Sort_Order: 20 }
            ]
        });

        await createPlexOrder(order, customerCode, testUUID, buildingCode, req, res);

        // Truck_Type_Key is no longer added to the shipToRequest
        expect(addCustomerAddress).toHaveBeenCalledWith(
            expect.objectContaining({
                body: shipToRequest
            }),
            res,
            { plain: true }
        );
    });

    it('should handle order with zero monetary values', async () => {
        order.total_paid = 0;
        order.tax_amount = 0;
        order.shipping_amount = 0;

        await createPlexOrder(order, customerCode, testUUID, buildingCode, req, res);

        expect(addSalesOrder).toHaveBeenCalledWith(
            expect.objectContaining({
                body: expect.objectContaining({
                    Prepaid_Amount: 0,
                    Tax_Amount: 0,
                    Freight_Amount: 0
                })
            }),
            res,
            { plain: true }
        );
    });

    it('should handle order with string monetary values', async () => {
        order.total_paid = '109.97';
        order.tax_amount = '8.8';
        order.shipping_amount = '12.99';

        await createPlexOrder(order, customerCode, testUUID, buildingCode, req, res);

        expect(addSalesOrder).toHaveBeenCalledWith(
            expect.objectContaining({
                body: expect.objectContaining({
                    Prepaid_Amount: 109.97,
                    Tax_Amount: 8.8,
                    Freight_Amount: 12.99
                })
            }),
            res,
            { plain: true }
        );
    });

    it('should return early if order header creation fails but not if it\'s a duplicate order', async () => {
        // Result_Error exists but ResultCode is not 18
        addSalesOrder.mockResolvedValue({
            data: {
                outputs: {
                    Result_Error: 'Failed to create order',
                    ResultCode: 10  // Some other error code
                }
            }
        });

        const result = await createPlexOrder(order, customerCode, testUUID, buildingCode, req, res);

        expect(result).toBeUndefined();
        expect(addSalesOrderLineItem).not.toHaveBeenCalled();

        // Now test with duplicate order (ResultCode 18)
        addSalesOrder.mockResolvedValue({
            data: {
                outputs: {
                    Result_Error: 'Order already exists',
                    ResultCode: 18  // Duplicate order code
                }
            }
        });

        const duplicateResult = await createPlexOrder(order, customerCode, testUUID, buildingCode, req, res);

        // Should not return early for ResultCode 18
        expect(duplicateResult).toBeDefined(); 
        expect(addSalesOrderLineItem).toHaveBeenCalled();
    });

    it('should return the order header result on success', async () => {
        const mockOrderResult = {
            data: {
                outputs: {
                    Result_Error: null,
                    Order_No: '10000043251'
                }
            }
        };

        addSalesOrder.mockResolvedValue(mockOrderResult);

        const result = await createPlexOrder(order, customerCode, testUUID, buildingCode, req, res);

        expect(result).toEqual(mockOrderResult);
    });

    it('should handle duplicate order (ResultCode 18)', async () => {
        addSalesOrder.mockResolvedValue({
            data: {
                outputs: {
                    Result_Error: null,
                    ResultCode: 18
                }
            }
        });

        const result = await createPlexOrder(order, customerCode, testUUID, buildingCode, req, res);

        expect(addSalesOrderLineItem).toHaveBeenCalledTimes(2);

        expect(result).toEqual({
            data: {
                outputs: {
                    Result_Error: null,
                    ResultCode: 18
                }
            }
        });
    });

    it('should handle empty items array', async () => {
        order.items = [];

        await createPlexOrder(order, customerCode, testUUID, buildingCode, req, res);

        expect(addSalesOrderLineItem).not.toHaveBeenCalled();
    });
});