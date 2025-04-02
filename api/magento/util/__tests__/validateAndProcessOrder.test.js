const { createPlexOrder } = require('../createPlexOrder');
const { postOrder } = require('../postOrder');
const { getPart } = require('../../../plex/index');
const { validateAndProcessOrder } = require('../validateAndProcessOrder');

jest.mock('../createPlexOrder', () => ({
    createPlexOrder: jest.fn()
}));

jest.mock('../postOrder', () => ({
    postOrder: jest.fn()
}));

jest.mock('../../../plex/index', () => ({
    getPart: jest.fn()
}));

describe('validateAndProcessOrder tests', () => {
    let order;
    let customerNo;
    let customerCode;
    let testUUID;
    let baseUrl;
    let buildingCode;
    let accessToken;
    let req;
    let res;

    beforeEach(() => {
        order = {
            entity_id: 5678,
            increment_id: '10000054323',
            items: [
                { sku: '1234', qty_ordered: 2, price: 29.99 },
                { sku: '5678', qty_ordered: 1, price: 49.99 }
            ]
        };

        customerNo = { data: [{ Customer_No: 'TEST.CUSTOMER' }] };
        customerCode = 'TEST.CODE';
        testUUID = 'test-uuid-123';  // Initialize testUUID with a value
        baseUrl = 'https://shop.test.com';
        buildingCode = 'TEST.BUILDING';
        accessToken = 'mock-access-token';
        req = { query: {} };
        res = { status: jest.fn(() => res), json: jest.fn() };

        getPart.mockResolvedValue({
            data: [{ Ecommerce: true }]
        });

        createPlexOrder.mockResolvedValue({
            sales_order: {
                data: {
                    outputs: {
                        Result_Error: null
                    }
                }
            }
        });

        postOrder.mockResolvedValue({ status: 'success' });

        jest.clearAllMocks();

        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    it('should validate and process order successfully', async () => {
        const result = await validateAndProcessOrder(
            order, customerNo, customerCode, testUUID, baseUrl, buildingCode, accessToken, req, res
        );

        expect(getPart).toHaveBeenCalledTimes(2);
        expect(getPart).toHaveBeenCalledWith(
            expect.objectContaining({ body: { partNo: '1234' } }),
            res,
            { plain: true }
        );
        expect(getPart).toHaveBeenCalledWith(
            expect.objectContaining({ body: { partNo: '5678' } }),
            res,
            { plain: true }
        );

        // customerNo is no longer passed to createPlexOrder
        expect(createPlexOrder).toHaveBeenCalledWith(
            order, customerCode, testUUID, buildingCode, req, res
        );

        expect(postOrder).toHaveBeenCalledWith(
            baseUrl, accessToken, order.entity_id, { status: 'plex_synced' }
        );

        expect(result).toEqual({
            sales_order: {
                data: {
                    outputs: {
                        Result_Error: null
                    }
                }
            }
        });
    });

    it('should return early if part validation fails', async () => {
        getPart
            .mockResolvedValueOnce({ data: [{ Ecommerce: true }] })
            .mockResolvedValueOnce({ data: [{ Ecommerce: false }] });

        const result = await validateAndProcessOrder(
            order, customerNo, customerCode, testUUID, baseUrl, buildingCode, accessToken, req, res
        );

        expect(getPart).toHaveBeenCalledTimes(2);
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('Validation failed for SKU 5678: Part exists, but Ecommerce is not enabled')
        );
        expect(createPlexOrder).not.toHaveBeenCalled();
        expect(postOrder).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it('should return early if part does not exist', async () => {
        getPart
            .mockResolvedValueOnce({ data: [{ Ecommerce: true }] })
            .mockResolvedValueOnce({ data: [] });

        const result = await validateAndProcessOrder(
            order, customerNo, customerCode, testUUID, baseUrl, buildingCode, accessToken, req, res
        );

        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('Validation failed for SKU 5678: Part does not exist in Plex')
        );
        expect(createPlexOrder).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it('should handle duplicate orders (ResultCode 18)', async () => {
        createPlexOrder.mockResolvedValue({
            sales_order: {
                data: {
                    outputs: {
                        ResultCode: 18,
                        Result_Error: null
                    }
                }
            }
        });

        const result = await validateAndProcessOrder(
            order, customerNo, customerCode, testUUID, baseUrl, buildingCode, accessToken, req, res
        );

        expect(createPlexOrder).toHaveBeenCalled();
        expect(postOrder).toHaveBeenCalledWith(
            baseUrl, accessToken, order.entity_id, { status: 'plex_synced' }
        );
        expect(result).toEqual({
            sales_order: {
                data: {
                    outputs: {
                        ResultCode: 18,
                        Result_Error: null
                    }
                }
            }
        });
    });

    it('should return early if order creation fails', async () => {
        createPlexOrder.mockResolvedValue({
            sales_order: {
                data: {
                    outputs: {
                        Result_Error: 'Failed to create order'
                    }
                }
            }
        });

        const result = await validateAndProcessOrder(
            order, customerNo, customerCode, testUUID, baseUrl, buildingCode, accessToken, req, res
        );

        expect(createPlexOrder).toHaveBeenCalled();
        expect(postOrder).not.toHaveBeenCalled();
        expect(result).toEqual({
            sales_order: {
                data: {
                    outputs: {
                        Result_Error: 'Failed to create order'
                    }
                }
            }
        });
    });

    it('should handle status update errors gracefully', async () => {
        postOrder.mockRejectedValue(new Error('Status update failed'));

        const result = await validateAndProcessOrder(
            order, customerNo, customerCode, testUUID, baseUrl, buildingCode, accessToken, req, res
        );

        expect(postOrder).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
            'Failed to update order 10000054323:',
            expect.any(Error)
        );
        expect(result).toEqual({
            sales_order: {
                data: {
                    outputs: {
                        Result_Error: null
                    }
                }
            }
        });
    });

    it('should handle empty items array', async () => {
        order.items = [];

        const result = await validateAndProcessOrder(
            order, customerNo, customerCode, testUUID, baseUrl, buildingCode, accessToken, req, res
        );

        expect(getPart).not.toHaveBeenCalled();
        expect(createPlexOrder).toHaveBeenCalled();
        expect(postOrder).toHaveBeenCalled();
    });
});