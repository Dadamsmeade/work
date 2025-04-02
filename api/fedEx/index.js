const axios = require('axios');
const { serverResponse } = require('../../../../lib/server-response');
const { normalizeError } = require('../../../../lib/normalize-error');
const {
    addIntegratedShippingTrackingNo,
    deleteIntegratedShippingTrackingNo,
    getShippedContainers,
    updateCustomerShipperSimple,
    updateIntegratedShipper,
    updateIntegratedShippingConfirmation,
    updateShipperFreight,
    updateTruck,
} = require('../plex/index');
const { getValidAddress } = require('./util/getValidAddress');
const { cancelShipment } = require('./util/cancelShipment');
const { getAddressRequest } = require('./util/getAddressRequest');
const { getLabelData } = require('./util/getLabelData');
const { getRateRequest } = require('./util/getRateRequest');
const { getShipment } = require('./util/getShipment');
const { getToken } = require('./util/getToken');
const shipmentService = require('../../../feature/services/shipmentService');
const shippingLabelService = require('../../../feature/services/shippingLabelService');

module.exports = {
    validateAddress: async (req, res, next) => {
        try {
            const addressRequest = getAddressRequest(req);
            const validatedAddress = await getValidAddress(req, addressRequest);
            return serverResponse(res, validatedAddress);
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    getRate: async (req, res, next) => {
        try {
            const rateRequest = await getRateRequest(req, res, next, { plain: true });
            const bearerToken = await getToken(req);
            const rate = await axios.post(
                'https://apis.fedex.com/rate/v1/rates/quotes',
                rateRequest,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-locale': 'en_US',
                        Authorization: `Bearer ${bearerToken}`,
                    },
                },
            );
            return serverResponse(res, rate.data);
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    voidShipment: async (req, res, next) => {
        try {
            const { Account_Number } = await shipmentService.getShipment(req);
            const voidedShipment = await cancelShipment(req, res, next, Account_Number, {
                plain: true,
            });
            const voidedShipmentTransaction = await shipmentService.voidShipment(req);

            const now = new Date();
            const dateOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            };
            const shipperNote = `FedEx shipment voided on ${now.toLocaleDateString(
                'en-US',
                dateOptions,
            )} UTC`;
            const containers = await getShippedContainers(req, res, next, {
                plain: true,
            });

            let modifiedReq = {
                ...req,
                body: {
                    ...req.body,
                    actualRate: 0,
                    standardRate: 0,
                },
            };
            const voidedShipperFreight = await updateShipperFreight(
                modifiedReq,
                res,
                next,
                { plain: true },
            );

            for (const container of containers.data) {
                await deleteIntegratedShippingTrackingNo(
                    req,
                    res,
                    next,
                    {
                        containerKey: container.Container_Key,
                        shipperKey: req.query.shipperKey,
                    },
                    {
                        plain: true,
                    },
                );

                // for revision history
                await addIntegratedShippingTrackingNo(
                    req,
                    res,
                    next,
                    container.Container_Key,
                    '', // nullify the tracking number on each container
                    true,
                    { plain: true },
                );

                // clear the null tracking number as well
                await deleteIntegratedShippingTrackingNo(
                    req,
                    res,
                    next,
                    {
                        containerKey: container.Container_Key,
                        shipperKey: req.query.shipperKey,
                    },
                    {
                        plain: true,
                    },
                );
            }

            const deletedShippingLabel = await shippingLabelService.deleteShippingLabel(
                modifiedReq,
            );

            modifiedReq.body.trackingNo = '';
            modifiedReq.body.shipperNote = shipperNote;
            const updatedCustomerShipperSimple = await updateCustomerShipperSimple(
                modifiedReq,
                res,
                next,
                {
                    plain: true,
                },
            );

            const plexConfirmation = await updateIntegratedShippingConfirmation(
                modifiedReq,
                res,
                next,
                { plain: true },
            );

            return serverResponse(res, {
                voidShipmentConfirmation: voidedShipment.data,
                updatedCustomerShipperSimple: updatedCustomerShipperSimple,
                voidedShippeFreight: voidedShipperFreight,
                plexConfirmation: plexConfirmation,
                voidedShipmentTransaction: voidedShipmentTransaction,
                deletedShippingLabel: deletedShippingLabel,
            });
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    /**
     * wrapper for FedEx shipment creation and Plex updates
     */
    syncShipment: async (req, res, next) => {
        try {
            const updatedIntegratedShipper = await updateIntegratedShipper(
                req,
                res,
                next,
                {
                    plain: true,
                },
            );
            const shipment = await getShipment(req, res, next, {
                plain: true,
            });

            const shipmentDetails =
                shipment?.data.output.transactionShipments[0].completedShipmentDetail
                    .shipmentRating?.shipmentRateDetails[0];

            const labelData = getLabelData(shipment);

            const modifiedReq = {
                ...req,
                body: {
                    ...req.body,
                    actualRate: shipmentDetails?.totalNetCharge,
                    confirmationDate: new Date(
                        shipment?.data.output.transactionShipments[0].shipDatestamp,
                    ).toISOString(),
                    standardRate: shipmentDetails?.totalBaseCharge,
                    trackingNo:
                        shipment?.data.output.transactionShipments[0]
                            .masterTrackingNumber,
                    url: labelData?.url,
                    batch: labelData?.batch,
                },
            };

            const updatedTruck = await updateTruck(modifiedReq, res, next, {
                plain: true,
            });

            const updatedIntegratedShippingConfirmation =
                await updateIntegratedShippingConfirmation(modifiedReq, res, next, {
                    plain: true,
                });

            const updatedCustomerShipperSimple = await updateCustomerShipperSimple(
                modifiedReq,
                res,
                next,
                { plain: true },
            );

            const updatedShipperFreight = await updateShipperFreight(
                modifiedReq,
                res,
                next,
                { plain: true },
            );

            for (const container of req.body.containers) {
                await addIntegratedShippingTrackingNo(
                    // labelData and labelType are optional params here, maybe to store the label data in Plex
                    req,
                    res,
                    next,
                    container.Container_Key,
                    shipment.data.output.transactionShipments[0].masterTrackingNumber,
                    true,
                    { plain: true },
                );
            }

            const createdShipmentTransaction = await shipmentService.createShipment(
                modifiedReq,
            );

            const createdShippingLabelTransaction =
                await shippingLabelService.createShippingLabel(modifiedReq);

            return serverResponse(res, {
                createdShipment: shipment.data,
                updatedTruck: updatedTruck,
                updatedIntegratedShippingConfirmation:
                    updatedIntegratedShippingConfirmation,
                updatedCustomerShipperSimple: updatedCustomerShipperSimple,
                updatedIntegratedShipper: updatedIntegratedShipper,
                updatedShipperFreight: updatedShipperFreight,
                createdShipmentTransaction: createdShipmentTransaction,
                createdShippingLabelTransaction: createdShippingLabelTransaction,
            });
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },
};
