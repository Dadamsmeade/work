const { voidShipment } = require('../index');
const { deleteShipment } = require('../util/deleteShipment');
const shipmentService = require('../../../../feature/services/shipmentService');
const {
    getShippedContainers,
    updateShipperFreight,
    deleteIntegratedShippingTrackingNo,
    addIntegratedShippingTrackingNo,
    updateCustomerShipperSimple,
    updateIntegratedShippingConfirmation,
} = require('../../plex');
const shippingLabelService = require('../../../../feature/services/shippingLabelService');
const { serverResponse } = require('../../../../../lib/server-response');

jest.mock('../util/deleteShipment');
jest.mock('../../../../feature/services/shipmentService');
jest.mock('../../plex');
jest.mock('../../../../feature/services/shippingLabelService');
jest.mock('../../../../../lib/server-response');

describe('voidShipment', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            query: { shipperKey: '123' },
            body: {},
        };
        res = {};
        next = jest.fn();
        console.error = jest.fn();
        jest.clearAllMocks();
    });

    it('should successfully void a shipment', async () => {
        const mockDate = new Date('2024-07-13T12:00:00Z');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

        deleteShipment.mockResolvedValue({ voidedShipment: true });
        shipmentService.voidShipment.mockResolvedValue({ voidedTransaction: true });
        getShippedContainers.mockResolvedValue({
            data: [{ Container_Key: '456' }, { Container_Key: '789' }],
        });
        updateShipperFreight.mockResolvedValue({ updatedFreight: true });
        deleteIntegratedShippingTrackingNo.mockResolvedValue({ deletedTrackingNo: true });
        addIntegratedShippingTrackingNo.mockResolvedValue({ addedNullTrackingNo: true });
        shippingLabelService.deleteShippingLabel.mockResolvedValue({
            deletedLabel: true,
        });
        updateCustomerShipperSimple.mockResolvedValue({ updatedCustomerShipper: true });
        updateIntegratedShippingConfirmation.mockResolvedValue({
            updatedConfirmation: true,
        });
        serverResponse.mockImplementation((res, data) => data);

        const result = await voidShipment(req, res, next);
        expect(deleteShipment).toHaveBeenCalledWith(req, res, { plain: true });
        expect(shipmentService.voidShipment).toHaveBeenCalledWith(req);
        expect(getShippedContainers).toHaveBeenCalledWith(req, res, next, {
            plain: true,
        });
        expect(updateShipperFreight).toHaveBeenCalled();
        expect(deleteIntegratedShippingTrackingNo).toHaveBeenCalledTimes(4); // 2 times for each container
        expect(addIntegratedShippingTrackingNo).toHaveBeenCalledTimes(2);
        expect(shippingLabelService.deleteShippingLabel).toHaveBeenCalled();
        expect(updateCustomerShipperSimple).toHaveBeenCalled();
        expect(updateIntegratedShippingConfirmation).toHaveBeenCalled();

        expect(result).toEqual({
            voidShipmentConfirmation: { voidedShipment: true },
            voidedShippeFreight: { updatedFreight: true },
            updatedCustomerShipperSimple: { updatedCustomerShipper: true },
            plexConfirmation: { updatedConfirmation: true },
            voidedShipmentTransaction: { voidedTransaction: true },
            deletedShippingLabel: { deletedLabel: true },
        });

        // Check if the shipper note is correctly formatted
        expect(updateCustomerShipperSimple).toHaveBeenCalledWith(
            expect.objectContaining({
                body: expect.objectContaining({
                    shipperNote: expect.stringMatching(
                        /^UPS shipment voided on July 13, 2024 at \d{1,2}:\d{2} (AM|PM) UTC$/,
                    ),
                }),
            }),
            res,
            next,
            { plain: true },
        );
    });

    it('should correctly modify the request object', async () => {
        deleteShipment.mockResolvedValue({});
        shipmentService.voidShipment.mockResolvedValue({});
        getShippedContainers.mockResolvedValue({ data: [] });
        updateShipperFreight.mockResolvedValue({});
        shippingLabelService.deleteShippingLabel.mockResolvedValue({});
        updateCustomerShipperSimple.mockResolvedValue({});
        updateIntegratedShippingConfirmation.mockResolvedValue({});

        await voidShipment(req, res, next);
        expect(updateShipperFreight).toHaveBeenCalledWith(
            expect.objectContaining({
                body: expect.objectContaining({
                    actualRate: 0,
                    standardRate: 0,
                }),
            }),
            res,
            next,
            { plain: true },
        );

        expect(updateCustomerShipperSimple).toHaveBeenCalledWith(
            expect.objectContaining({
                body: expect.objectContaining({
                    trackingNo: '',
                    shipperNote: expect.any(String),
                }),
            }),
            res,
            next,
            { plain: true },
        );
    });
});
