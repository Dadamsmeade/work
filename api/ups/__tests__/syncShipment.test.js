const { syncShipment } = require('../index');
const {
    updateIntegratedShipper,
    updateTruck,
    updateIntegratedShippingConfirmation,
    updateCustomerShipperSimple,
    updateShipperFreight,
    addIntegratedShippingTrackingNo,
} = require('../../plex');
const { getShipment } = require('../util/getShipment');
const shipmentService = require('../../../../feature/services/shipmentService');
const shippingLabelService = require('../../../../feature/services/shippingLabelService');
const { serverResponse } = require('../../../../../lib/server-response');
const { normalizeError } = require('../../../../../lib/normalize-error');

jest.mock('../../plex');
jest.mock('../util/getShipment');
jest.mock('../../../../feature/services/shipmentService');
jest.mock('../../../../feature/services/shippingLabelService');
jest.mock('../../../../../lib/server-response');
jest.mock('../../../../../lib/normalize-error');

describe('syncShipment', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            query: {},
            body: {
                containers: [{ Container_Key: '123' }, { Container_Key: '456' }],
            },
        };
        res = {};
        next = jest.fn();
        console.trace = jest.fn();
        jest.clearAllMocks();
    });

    it('should successfully sync a shipment', async () => {
        const mockShipment = {
            data: {
                ShipmentResponse: {
                    ShipmentResults: {
                        PackageResults: [
                            { ShippingLabel: { ImageFormat: { Code: 'GIF' } } },
                        ],
                        ShipmentCharges: {
                            TotalCharges: { MonetaryValue: '10.00' },
                            TransportationCharges: { MonetaryValue: '8.00' },
                        },
                        ShipmentIdentificationNumber: '1Z999AA1234567890',
                        LabelURL: 'http://example.com/label',
                    },
                },
            },
        };

        updateIntegratedShipper.mockResolvedValue({ updatedShipper: true });
        getShipment.mockResolvedValue(mockShipment);
        updateTruck.mockResolvedValue({ updatedTruck: true });
        updateIntegratedShippingConfirmation.mockResolvedValue({
            updatedConfirmation: true,
        });
        updateCustomerShipperSimple.mockResolvedValue({ updatedCustomerShipper: true });
        updateShipperFreight.mockResolvedValue({ updatedShipperFreight: true });
        addIntegratedShippingTrackingNo.mockResolvedValue({ addedTrackingNo: true });
        shipmentService.createShipment.mockResolvedValue({ createdShipment: true });
        shippingLabelService.createShippingLabel.mockResolvedValue({
            createdLabel: true,
        });
        serverResponse.mockImplementation((res, data) => data);

        const result = await syncShipment(req, res, next);
        expect(updateIntegratedShipper).toHaveBeenCalledWith(req, res, next, {
            plain: true,
        });
        expect(getShipment).toHaveBeenCalledWith(req, res, next, { plain: true });
        expect(updateTruck).toHaveBeenCalled();
        expect(updateIntegratedShippingConfirmation).toHaveBeenCalled();
        expect(updateCustomerShipperSimple).toHaveBeenCalled();
        expect(updateShipperFreight).toHaveBeenCalled();
        expect(addIntegratedShippingTrackingNo).toHaveBeenCalledTimes(2);
        expect(shipmentService.createShipment).toHaveBeenCalled();
        expect(shippingLabelService.createShippingLabel).toHaveBeenCalled();

        expect(result).toEqual({
            createdShipment: mockShipment.data,
            updatedTruck: { updatedTruck: true },
            updatedIntegratedShipper: { updatedShipper: true },
            updatedIntegratedShippingConfirmation: { updatedConfirmation: true },
            updatedShipperFreight: { updatedShipperFreight: true },
            updatedCustomerShipperSimple: { updatedCustomerShipper: true },
            createdShipmentTransaction: { createdShipment: true },
            createdShippingLabelTransaction: { createdLabel: true },
        });
    });

    it('should handle errors and call next with the error', async () => {
        const mockError = new Error('Test error');
        updateIntegratedShipper.mockRejectedValue(mockError);
        normalizeError.mockReturnValue('Normalized error');

        await syncShipment(req, res, next);
        expect(console.trace).toHaveBeenCalledWith('Normalized error');
        expect(normalizeError).toHaveBeenCalledWith(mockError);
        expect(next).toHaveBeenCalledWith(mockError);
    });

    it('should correctly modify the request object', async () => {
        const mockShipment = {
            data: {
                ShipmentResponse: {
                    ShipmentResults: {
                        PackageResults: [
                            { ShippingLabel: { ImageFormat: { Code: 'GIF' } } },
                        ],
                        ShipmentCharges: {
                            TotalCharges: { MonetaryValue: '10.00' },
                            TransportationCharges: { MonetaryValue: '8.00' },
                        },
                        ShipmentIdentificationNumber: '1Z999AA1234567890',
                        LabelURL: 'http://example.com/label',
                    },
                },
            },
        };

        updateIntegratedShipper.mockResolvedValue({});
        getShipment.mockResolvedValue(mockShipment);

        await syncShipment(req, res, next);
        expect(updateTruck).toHaveBeenCalledWith(
            expect.objectContaining({
                query: expect.objectContaining({
                    selectedImageType: 'GIF',
                }),
                body: expect.objectContaining({
                    actualRate: 10,
                    standardRate: 8,
                    trackingNo: '1Z999AA1234567890',
                    url: 'http://example.com/label',
                    batch: false,
                }),
            }),
            res,
            next,
            { plain: true },
        );
    });
});