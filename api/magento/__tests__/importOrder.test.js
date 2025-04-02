const { importOrders } = require('../index');
const { serverResponse } = require('../../../../../lib/server-response');
const { normalizeError } = require('../../../../../lib/normalize-error');
const { getCustomerNo } = require('../../plex');
const { getOrders } = require('../util/getOrders');
const { getMagentoConfig } = require('../util/getMagentoConfig');
const { getActiveBuildingCode } = require('../util/getActiveBuildingCode');
const { validateAndProcessOrder } = require('../util/validateAndProcessOrder');

jest.mock('../../../../../lib/server-response');
jest.mock('../../../../../lib/normalize-error');
jest.mock('../../plex');
jest.mock('../util/getOrders');
jest.mock('../util/getMagentoConfig');
jest.mock('../util/getActiveBuildingCode');
jest.mock('../util/validateAndProcessOrder');

describe('importOrders tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            query: {
                customerCode: 'TEST123',
                testUUID: 'test-uuid-123'  // Added testUUID to request query
            }
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn()
        };
        next = jest.fn();

        getMagentoConfig.mockResolvedValue({
            accessToken: { value: 'mock-token' },
            baseUrl: { value: 'https://magento.example.com' },
            fromDateStr: '2023-01-01T00:00:00Z',
            toDateStr: '2023-01-31T23:59:59Z'
        });

        getActiveBuildingCode.mockResolvedValue('BLD001');

        getCustomerNo.mockResolvedValue({
            data: [{ Customer_No: 'CUST123' }]
        });

        getOrders.mockResolvedValue({
            data: {
                items: [
                    { entity_id: 1001, increment_id: 'ORDER1001' },
                    { entity_id: 1002, increment_id: 'ORDER1002' },
                    { entity_id: 1003, increment_id: 'ORDER1003' }
                ]
            }
        });

        validateAndProcessOrder.mockResolvedValue({
            status: 'success'
        });

        serverResponse.mockImplementation((res, data) => data);
        normalizeError.mockImplementation(error => error);

        jest.spyOn(console, 'trace').mockImplementation();

        jest.clearAllMocks();
    });

    afterEach(() => {
        console.trace.mockRestore();
    });

    it('should synchronize orders from Magento to Plex successfully', async () => {
        await importOrders(req, res, next);

        expect(getMagentoConfig).toHaveBeenCalledWith(req);
        expect(getActiveBuildingCode).toHaveBeenCalledWith(req, res);
        expect(getCustomerNo).toHaveBeenCalledWith(req, res, { plain: true });
        expect(getOrders).toHaveBeenCalledWith(
            'https://magento.example.com',
            'mock-token',
            '2023-01-01T00:00:00Z',
            '2023-01-31T23:59:59Z',
            'plex_synced'
        );
        expect(validateAndProcessOrder).toHaveBeenCalledTimes(3);

        // Updated expectation with correct parameter order including testUUID
        expect(validateAndProcessOrder).toHaveBeenCalledWith(
            { entity_id: 1001, increment_id: 'ORDER1001' },
            { data: [{ Customer_No: 'CUST123' }] },
            'TEST123',
            'test-uuid-123',  // New testUUID parameter
            'https://magento.example.com',
            'BLD001',
            'mock-token',
            req,
            res
        );

        expect(serverResponse).toHaveBeenCalledWith(res, {
            completed: 3
        });
    });

    it('should handle when testUUID is not provided', async () => {
        // Remove testUUID from request
        delete req.query.testUUID;

        await importOrders(req, res, next);

        // Verify validateAndProcessOrder is called with undefined for testUUID
        expect(validateAndProcessOrder).toHaveBeenCalledWith(
            expect.any(Object),
            expect.any(Object),
            'TEST123',
            undefined,  // testUUID should be undefined
            'https://magento.example.com',
            'BLD001',
            'mock-token',
            req,
            res
        );
    });

    it('should handle errors and call next with the error', async () => {
        const mockError = new Error('Test error');
        getMagentoConfig.mockRejectedValue(mockError);

        await importOrders(req, res, next);

        expect(console.trace).toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(mockError);
    });

    it('should filter out failed order processing', async () => {
        validateAndProcessOrder
            .mockResolvedValueOnce({ status: 'success' })
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({ status: 'success' });

        await importOrders(req, res, next);

        expect(serverResponse).toHaveBeenCalledWith(res, {
            completed: 2
        });
    });

    it('should process with the configured concurrency limit', async () => {
        // can't directly test the concurrency limit, but we can verify
        // that all orders were processed and the correct result is returned

        await importOrders(req, res, next);

        expect(validateAndProcessOrder).toHaveBeenCalledTimes(3);
        expect(serverResponse).toHaveBeenCalledWith(res, {
            completed: 3
        });
    });

    it('should handle empty orders array', async () => {
        getOrders.mockResolvedValue({
            data: {
                items: []
            }
        });

        await importOrders(req, res, next);

        expect(validateAndProcessOrder).not.toHaveBeenCalled();
        expect(serverResponse).toHaveBeenCalledWith(res, {
            completed: 0
        });
    });
});