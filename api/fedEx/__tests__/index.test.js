const axios = require('axios');
const { serverResponse } = require('../../../../../lib/server-response');
const { normalizeError } = require('../../../../../lib/normalize-error');
const {
    addIntegratedShippingTrackingNo,
    deleteIntegratedShippingTrackingNo,
    getShippedContainers,
    updateCustomerShipperSimple,
    updateIntegratedShipper,
    updateIntegratedShippingConfirmation,
    updateShipperFreight,
    updateTruck,
} = require('../../plex/index');
const { getValidAddress } = require('../util/getValidAddress');
const { cancelShipment } = require('../util/cancelShipment');
const { getAddressRequest } = require('../util/getAddressRequest');
const { getLabelData } = require('../util/getLabelData');
const { getRateRequest } = require('../util/getRateRequest');
const { getShipment } = require('../util/getShipment');
const { getToken } = require('../util/getToken');
const shipmentService = require('../../../../feature/services/shipmentService');
const shippingLabelService = require('../../../../feature/services/shippingLabelService');
const { validateAddress, getRate, voidShipment, syncShipment } = require('../index');
const { clearConsole } = require('../../../../../lib/test-utils');

jest.mock('axios');
jest.mock('../../../../../lib/server-response');
jest.mock('../../../../../lib/normalize-error');
jest.mock('../../plex/index');
jest.mock('../util/getValidAddress');
jest.mock('../util/cancelShipment');
jest.mock('../util/getAddressRequest');
jest.mock('../util/getLabelData');
jest.mock('../util/getRateRequest');
jest.mock('../util/getShipment');
jest.mock('../util/getToken');
jest.mock('../../../../feature/services/shipmentService');
jest.mock('../../../../feature/services/shippingLabelService');

describe('API functions tests', () => {
    clearConsole();
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                containers: [],
            },
            query: {},
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('validateAddress', () => {
        it('should validate the address and respond with the result', async () => {
            const mockAddressRequest = { address: 'mock' };
            const mockValidatedAddress = { validated: 'address' };
            getAddressRequest.mockReturnValue(mockAddressRequest);
            getValidAddress.mockResolvedValue(mockValidatedAddress);

            await validateAddress(req, res, next);

            expect(getAddressRequest).toHaveBeenCalledWith(req);
            expect(getValidAddress).toHaveBeenCalledWith(req, mockAddressRequest);
            expect(serverResponse).toHaveBeenCalledWith(res, mockValidatedAddress);
        });

        it('should handle errors correctly', async () => {
            const error = new Error('Test error');
            getValidAddress.mockRejectedValue(error);

            await validateAddress(req, res, next);

            expect(normalizeError).toHaveBeenCalledWith(error);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getRate', () => {
        it('should get the rate and respond with the result', async () => {
            const mockRateRequest = { rate: 'request' };
            const mockToken = 'mock_token';
            const mockRateResponse = { data: { rate: 'response' } };
            getRateRequest.mockResolvedValue(mockRateRequest);
            getToken.mockResolvedValue(mockToken);
            axios.post.mockResolvedValue(mockRateResponse);

            await getRate(req, res, next);

            expect(getRateRequest).toHaveBeenCalledWith(req, res, next, { plain: true });
            expect(getToken).toHaveBeenCalledWith(req);
            expect(axios.post).toHaveBeenCalledWith(
                'https://apis.fedex.com/rate/v1/rates/quotes',
                mockRateRequest,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-locale': 'en_US',
                        Authorization: `Bearer ${mockToken}`,
                    },
                },
            );
            expect(serverResponse).toHaveBeenCalledWith(res, mockRateResponse.data);
        });

        it('should handle errors correctly', async () => {
            const error = new Error('Test error');
            axios.post.mockRejectedValue(error);

            await getRate(req, res, next);

            expect(normalizeError).toHaveBeenCalledWith(error);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('voidShipment', () => {
        it('should void the shipment and respond with the result', async () => {
            const mockShipment = { Account_Number: 'mock_account' };
            const mockVoidShipment = { data: 'voided_shipment' };
            const mockVoidTransaction = { transaction: 'void_transaction' };
            const mockContainers = { data: [{ Container_Key: 'container_key' }] };
            shipmentService.getShipment.mockResolvedValue(mockShipment);
            cancelShipment.mockResolvedValue(mockVoidShipment);
            shipmentService.voidShipment.mockResolvedValue(mockVoidTransaction);
            getShippedContainers.mockResolvedValue(mockContainers);
            updateShipperFreight.mockResolvedValue('freight_voided');
            deleteIntegratedShippingTrackingNo.mockResolvedValue();
            addIntegratedShippingTrackingNo.mockResolvedValue();
            shippingLabelService.deleteShippingLabel.mockResolvedValue('label_deleted');
            updateCustomerShipperSimple.mockResolvedValue('updated_customer');
            updateIntegratedShippingConfirmation.mockResolvedValue(
                'updated_confirmation',
            );

            await voidShipment(req, res, next);

            expect(shipmentService.getShipment).toHaveBeenCalledWith(req);
            expect(cancelShipment).toHaveBeenCalledWith(req, res, next, 'mock_account', {
                plain: true,
            });
            expect(shipmentService.voidShipment).toHaveBeenCalledWith(req);
            expect(getShippedContainers).toHaveBeenCalledWith(req, res, next, {
                plain: true,
            });
            expect(updateShipperFreight).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: expect.objectContaining({ actualRate: 0, standardRate: 0 }),
                }),
                res,
                next,
                { plain: true },
            );
            expect(deleteIntegratedShippingTrackingNo).toHaveBeenCalledTimes(2);
            expect(addIntegratedShippingTrackingNo).toHaveBeenCalled();
            expect(shippingLabelService.deleteShippingLabel).toHaveBeenCalled();
            expect(updateCustomerShipperSimple).toHaveBeenCalled();
            expect(updateIntegratedShippingConfirmation).toHaveBeenCalled();
            expect(serverResponse).toHaveBeenCalledWith(
                res,
                expect.objectContaining({
                    voidShipmentConfirmation: 'voided_shipment',
                    updatedCustomerShipperSimple: 'updated_customer',
                    voidedShippeFreight: 'freight_voided',
                    plexConfirmation: 'updated_confirmation',
                    voidedShipmentTransaction: mockVoidTransaction,
                    deletedShippingLabel: 'label_deleted',
                }),
            );
        });

        it('should handle errors correctly', async () => {
            const error = new Error('Test error');
            shipmentService.getShipment.mockRejectedValue(error);

            await voidShipment(req, res, next);

            expect(normalizeError).toHaveBeenCalledWith(error);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('syncShipment', () => {
        it('should sync the shipment and respond with the result', async () => {
            const mockShipment = {
                data: {
                    output: {
                        transactionShipments: [
                            {
                                completedShipmentDetail: {
                                    shipmentRating: {
                                        shipmentRateDetails: [
                                            {
                                                totalNetCharge: 'net_charge',
                                                totalBaseCharge: 'base_charge',
                                            },
                                        ],
                                    },
                                },
                                shipDatestamp: '2023-01-01T00:00:00Z',
                                masterTrackingNumber: 'tracking_number',
                            },
                        ],
                    },
                },
            };
            const mockLabelData = { url: 'label_url', batch: 'label_batch' };
            updateIntegratedShipper.mockResolvedValue('updated_integrated_shipper');
            getShipment.mockResolvedValue(mockShipment);
            getLabelData.mockReturnValue(mockLabelData);
            updateTruck.mockResolvedValue('updated_truck');
            updateIntegratedShippingConfirmation.mockResolvedValue(
                'updated_confirmation',
            );
            updateCustomerShipperSimple.mockResolvedValue('updated_customer');
            updateShipperFreight.mockResolvedValue('updated_freight');
            shipmentService.createShipment.mockResolvedValue('created_shipment');
            shippingLabelService.createShippingLabel.mockResolvedValue('created_label');
            addIntegratedShippingTrackingNo.mockResolvedValue();

            await syncShipment(req, res, next);

            expect(updateIntegratedShipper).toHaveBeenCalledWith(req, res, next, {
                plain: true,
            });
            expect(getShipment).toHaveBeenCalledWith(req, res, next, { plain: true });
            expect(getLabelData).toHaveBeenCalledWith(mockShipment);
            expect(updateTruck).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: expect.objectContaining({
                        actualRate: 'net_charge',
                        confirmationDate: '2023-01-01T00:00:00.000Z',
                        standardRate: 'base_charge',
                        trackingNo: 'tracking_number',
                        url: 'label_url',
                        batch: 'label_batch',
                    }),
                }),
                res,
                next,
                { plain: true },
            );
            expect(updateIntegratedShippingConfirmation).toHaveBeenCalled();
            expect(updateCustomerShipperSimple).toHaveBeenCalled();
            expect(updateShipperFreight).toHaveBeenCalled();
            expect(addIntegratedShippingTrackingNo).toHaveBeenCalledTimes(
                req.body.containers.length,
            );
            expect(shipmentService.createShipment).toHaveBeenCalled();
            expect(shippingLabelService.createShippingLabel).toHaveBeenCalled();
            expect(serverResponse).toHaveBeenCalledWith(
                res,
                expect.objectContaining({
                    createdShipment: mockShipment.data,
                    updatedTruck: 'updated_truck',
                    updatedIntegratedShippingConfirmation: 'updated_confirmation',
                    updatedCustomerShipperSimple: 'updated_customer',
                    updatedIntegratedShipper: 'updated_integrated_shipper',
                    updatedShipperFreight: 'updated_freight',
                    createdShipmentTransaction: 'created_shipment',
                    createdShippingLabelTransaction: 'created_label',
                }),
            );
        });

        it('should handle errors correctly', async () => {
            const error = new Error('Test error');
            updateIntegratedShipper.mockRejectedValue(error);

            await syncShipment(req, res, next);

            expect(normalizeError).toHaveBeenCalledWith(error);
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
