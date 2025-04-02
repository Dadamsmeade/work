const { exec } = require('../upsService');
const { ups } = require('../../api');

jest.mock('../../api', () => ({
    ups: {
        validateAddress: jest.fn(),
        getRate: jest.fn(),
        voidShipment: jest.fn(),
        syncShipment: jest.fn(),
    },
}));

describe('exec function tests for UPS', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: {
                type: 'get-rate',
            },
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call the correct endpoint function based on the type parameter', () => {
        exec(req, res, next);

        expect(ups.getRate).toHaveBeenCalledWith(req, res, next);
    });

    it('should call next with an error if the endpoint is not found', () => {
        req.params.type = 'non-existent-endpoint';

        exec(req, res, next);

        expect(next).toHaveBeenCalledWith(
            new Error('Endpoint not found for: non-existent-endpoint'),
        );
        expect(ups.getRate).not.toHaveBeenCalled();
        expect(ups.validateAddress).not.toHaveBeenCalled();
        expect(ups.voidShipment).not.toHaveBeenCalled();
        expect(ups.syncShipment).not.toHaveBeenCalled();
    });

    it('should call ups.validateAddress when type is validate-address', () => {
        req.params.type = 'validate-address';

        exec(req, res, next);

        expect(ups.validateAddress).toHaveBeenCalledWith(req, res, next);
    });

    it('should call ups.voidShipment when type is void-shipment', () => {
        req.params.type = 'void-shipment';

        exec(req, res, next);

        expect(ups.voidShipment).toHaveBeenCalledWith(req, res, next);
    });

    it('should call ups.syncShipment when type is sync-shipment', () => {
        req.params.type = 'sync-shipment';

        exec(req, res, next);

        expect(ups.syncShipment).toHaveBeenCalledWith(req, res, next);
    });
});
