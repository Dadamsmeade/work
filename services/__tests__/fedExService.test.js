const { exec } = require('../fedExService');
const { fedEx } = require('../../api');

jest.mock('../../api', () => ({
    fedEx: {
        getRate: jest.fn(),
        validateAddress: jest.fn(),
        voidShipment: jest.fn(),
        syncShipment: jest.fn(),
    },
}));

describe('exec function tests', () => {
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

        expect(fedEx.getRate).toHaveBeenCalledWith(req, res, next);
    });

    it('should call next with an error if the endpoint is not found', () => {
        req.params.type = 'non-existent-endpoint';

        exec(req, res, next);

        expect(next).toHaveBeenCalledWith(
            new Error('Endpoint not found for: non-existent-endpoint'),
        );
        expect(fedEx.getRate).not.toHaveBeenCalled();
        expect(fedEx.validateAddress).not.toHaveBeenCalled();
        expect(fedEx.voidShipment).not.toHaveBeenCalled();
        expect(fedEx.syncShipment).not.toHaveBeenCalled();
    });

    it('should call fedEx.validateAddress when type is validate-address', () => {
        req.params.type = 'validate-address';

        exec(req, res, next);

        expect(fedEx.validateAddress).toHaveBeenCalledWith(req, res, next);
    });

    it('should call fedEx.voidShipment when type is void-shipment', () => {
        req.params.type = 'void-shipment';

        exec(req, res, next);

        expect(fedEx.voidShipment).toHaveBeenCalledWith(req, res, next);
    });

    it('should call fedEx.syncShipment when type is sync-shipment', () => {
        req.params.type = 'sync-shipment';

        exec(req, res, next);

        expect(fedEx.syncShipment).toHaveBeenCalledWith(req, res, next);
    });
});
