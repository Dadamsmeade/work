const axios = require('axios');
const { normalizeError } = require('../../../../lib/normalize-error');
const { deleteShipment } = require('./util/deleteShipment');
const { getRateRequest } = require('./util/getRateRequest');
const { getShipment } = require('./util/getShipment');
const { getToken } = require('./util/getToken');
const { getValidAddress } = require('./util/getValidAddress');
const { getXAVRequest } = require('./util/getXAVRequest');
const {
    getCustomerAddressBuilding,
    getIntegratedShippingServiceTypes,
    addIntegratedShippingTrackingNo,
    updateIntegratedShippingConfirmation,
    updateIntegratedShipper,
    getShippedContainers,
    deleteIntegratedShippingTrackingNo,
    updateCustomerShipperSimple,
    updateShipperFreight,
    updateTruck,
} = require('../plex');
const { serverResponse } = require('../../../../lib/server-response');
const { getServiceType } = require('../../../../lib/get-service-type');
const shipmentService = require('../../../feature/services/shipmentService');
const shippingLabelService = require('../../../feature/services/shippingLabelService');

module.exports = {
    getRate: async (req, res, next) => {
        try {
            const bearerToken = await getToken(req);
            const serviceTypes = await getIntegratedShippingServiceTypes(req, res, next, {
                plain: true,
            });
            const serviceType = getServiceType(serviceTypes, req.query.selectedService);
            const shipFromAddress = await getCustomerAddressBuilding(req, res, next, {
                plain: true,
            });
            const rateRequest = getRateRequest(req, shipFromAddress.data[0], serviceType);
            const rate = await axios({
                method: 'POST',
                url: `https://onlinetools.ups.com/api/rating/v2403/Rate`,
                headers: {
                    'Content-Type': 'application/json',
                    transId: '',
                    transactionSrc: 'production',
                    Authorization: `Bearer ${bearerToken.access_token}`,
                },
                data: rateRequest,
            });

            return serverResponse(res, rate.data);
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

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

            const shipmentResults = shipment?.data.ShipmentResponse.ShipmentResults;

            const modifiedReq = {
                ...req,
                query: {
                    ...req.query,
                    selectedImageType:
                        shipmentResults?.PackageResults[0]?.ShippingLabel.ImageFormat
                            .Code,
                },
                body: {
                    ...req.body,
                    actualRate: parseFloat(
                        shipmentResults?.ShipmentCharges.TotalCharges.MonetaryValue,
                    ),
                    confirmationDate: new Date(),
                    standardRate: parseFloat(
                        shipmentResults?.ShipmentCharges.TransportationCharges
                            .MonetaryValue,
                    ),
                    trackingNo: shipmentResults?.ShipmentIdentificationNumber,
                    url: shipmentResults?.LabelURL,
                    batch: shipmentResults?.PackageResults.length > 1 ? true : false,
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
                    shipment?.data.ShipmentResponse.ShipmentResults
                        .ShipmentIdentificationNumber,
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
                updatedIntegratedShipper: updatedIntegratedShipper,
                updatedIntegratedShippingConfirmation:
                    updatedIntegratedShippingConfirmation,
                updatedShipperFreight: updatedShipperFreight,
                updatedCustomerShipperSimple: updatedCustomerShipperSimple,
                createdShipmentTransaction: createdShipmentTransaction,
                createdShippingLabelTransaction: createdShippingLabelTransaction,
            });
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    validateAddress: async (req, res, next) => {
        try {
            const bearerToken = await getToken(req);
            const XAVRequest = getXAVRequest(req);
            const validatedShipToAddress = await getValidAddress(bearerToken, XAVRequest);
            return serverResponse(res, validatedShipToAddress);
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    voidShipment: async (req, res, next) => {
        try {
            const voidedShipment = await deleteShipment(req, res, {
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
            const shipperNote = `UPS shipment voided on ${now.toLocaleDateString(
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
                voidShipmentConfirmation: voidedShipment,
                voidedShippeFreight: voidedShipperFreight,
                updatedCustomerShipperSimple: updatedCustomerShipperSimple,
                plexConfirmation: plexConfirmation,
                voidedShipmentTransaction: voidedShipmentTransaction,
                deletedShippingLabel: deletedShippingLabel,
            });
        } catch (error) {
            console.error(normalizeError(error));
            next(error);
        }
    },
};
