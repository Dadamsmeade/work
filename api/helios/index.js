const { serverResponse } = require('../../../../lib/server-response');
const { normalizeError } = require('../../../../lib/normalize-error');
const { sseBroadcast } = require('../sse');
const {
    getPlexCustomerByAuthType,
} = require('../../../connection/services/plexCustomerService');
const {
    createControlPlan,
    getControlPlan,
    getControlPlanQueue,
    updateControlPlan,
    updateControlPlanHeader,
    updateNextInQueue,
    purgeControlPlans,
} = require('../../repositories/controlPlanRepository');
const {
    createControlPlanLine,
} = require('../../repositories/controlPlanLineRepository.js');
const {
    getFullControlPlanDocuments,
    addChecksheetWithMeasurements,
    getWorkcenters,
} = require('../plex');
const { getMeasurementsInRange } = require('./util/getMeasurementsInRange.js');
const { getControlPlanAssets } = require('./util/getControlPlanAssets.js');
const { formatChecksheetResponse } = require('./util/formatChecksheetResponse.js');
const { validateControlPlan } = require('./validators');

module.exports = {
    getControlPlan: async (req, res, next) => {
        try {
            const activeControlPlan = await getControlPlan(req);

            if (activeControlPlan) {
                const plexCustomer = await getPlexCustomerByAuthType(req);
                const fullControlPlan = await getFullControlPlanDocuments(
                    req,
                    res,
                    activeControlPlan,
                    { plain: true },
                );
                const validatedControlPlan = validateControlPlan(fullControlPlan);

                // get any active control plan lines and update checksheet Measurements
                const controlPlanLines = JSON.parse(
                    activeControlPlan?.Control_Plan_Line?.dataValues
                        ?.Control_Plan_Lines || '[]',
                );

                validatedControlPlan.data.forEach(line => {
                    const match = controlPlanLines.find(
                        item =>
                            item.specificationDescription ===
                            line.Specification_Description,
                    );
                    if (match) line.Measurement = match.specActualMeasurement;
                });

                const controlPlanWithAssets = await getControlPlanAssets(
                    req,
                    plexCustomer,
                    validatedControlPlan,
                );

                return serverResponse(res, {
                    checksheetId: activeControlPlan.Control_Plan_Key,
                    workcenterCode: activeControlPlan.Workcenter_Code,
                    note: activeControlPlan.Control_Plan_Header.note,
                    checksheet: controlPlanWithAssets,
                });
            }

            return serverResponse(res, null);
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    getControlPlanQueue: async (req, res, next) => {
        try {
            const plexCustomer = await getPlexCustomerByAuthType(req);
            const controlPlanQueue = await getControlPlanQueue(req, plexCustomer);

            return serverResponse(res, {
                message: 'Queue status',
                controlPlanQueue: controlPlanQueue,
            });
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    setControlPlan: async (req, res, next) => {
        try {
            const { controlPlanHeader } = req.body;
            const { workcenter } = controlPlanHeader;

            const workcenterExists = await getWorkcenters(req, res, {
                plain: true,
            }); // check for the workcenter in Plex

            const fullControlPlan = await getFullControlPlanDocuments(req, res, null, {
                plain: true,
            }); // get a valid control plan before saving it
            const validatedControlPlan = validateControlPlan(fullControlPlan); // should stop execution and throw error if invalid

            const plexCustomer = await getPlexCustomerByAuthType(req);
            await purgeControlPlans(plexCustomer); // purge anything greater than a week

            const queuedControlPlan = await createControlPlan(
                req,
                plexCustomer,
                workcenterExists,
            );
            const controlPlanWithAssets = await getControlPlanAssets(
                req,
                plexCustomer,
                validatedControlPlan,
            );

            // Limit the keys in the checksheet response
            const formattedChecksheet = formatChecksheetResponse(
                controlPlanWithAssets.data,
            );

            if (queuedControlPlan.Active) {
                const broadcast = await sseBroadcast(workcenter, {
                    checksheetId: queuedControlPlan.Control_Plan_Key,
                    note: queuedControlPlan.Control_Plan_Header.note,
                    workcenterCode: queuedControlPlan.Workcenter_Code,
                    checksheet: controlPlanWithAssets,
                });
                return serverResponse(res, {
                    message: `Checksheet active`,
                    checksheetId: queuedControlPlan.Control_Plan_Key,
                    workcenterKey: workcenter,
                    workcenterCode: queuedControlPlan.Workcenter_Code,
                    broadcast,
                    checksheet: formattedChecksheet,
                });
            }

            return serverResponse(res, {
                message: 'Checksheet queued',
                checksheetId: queuedControlPlan.Control_Plan_Key,
                workcenterKey: workcenter,
                workcenterCode: queuedControlPlan.Workcenter_Code,
                checksheet: formattedChecksheet,
            });
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    setControlPlanLines: async (req, res, next) => {
        try {
            const { controlPlanHeader, controlPlanLines } = req.body;
            const { workcenter, note } = controlPlanHeader;

            await getWorkcenters(req, res, { plain: true });

            const plexCustomer = await getPlexCustomerByAuthType(req);

            const activeControlPlan = await getControlPlan(req, true, plexCustomer);

            if (!activeControlPlan) {
                const error = new Error('Control plan not found.');
                error.status = 404;
                throw error;
            }

            const updatedControlPlan = await updateControlPlanHeader(activeControlPlan, {
                note,
            });

            const fullControlPlan = await getFullControlPlanDocuments(
                req,
                res,
                updatedControlPlan,
                { plain: true },
            );
            const validatedControlPlan = validateControlPlan(fullControlPlan); // should stop execution and throw error if invalid

            const validatedControlPlanLines = getMeasurementsInRange(
                controlPlanLines,
                validatedControlPlan,
            );

            await createControlPlanLine(req, validatedControlPlanLines); // backup validated lines to the active control plan

            const result = await sseBroadcast(workcenter, {
                updatedNote: updatedControlPlan.Control_Plan_Header.note,
                validatedControlPlanLines: validatedControlPlanLines,
            });

            return serverResponse(res, {
                broadcast: result,
                updatedNote: updatedControlPlan.Control_Plan_Header.note,
                updatedControlPlanLines: validatedControlPlanLines, // limit the response
            });
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    updateControlPlan: async (req, res, next) => {
        try {
            const skippedControlPlan = await updateControlPlan(
                req.query.checksheetId,
                req.body,
            );

            if (!skippedControlPlan)
                throw new Error(`Error updating checksheetId: ${req.query.checksheetId}`);

            const activeControlPlan = await updateNextInQueue(null, { Active: true });

            return serverResponse(res, activeControlPlan);
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    syncChecksheet: async (req, res, next) => {
        try {
            // Submit the current checksheet
            const addedChecksheetToPlex = await addChecksheetWithMeasurements(
                req,
                res,
                next,
                { plain: true },
            );

            if (addedChecksheetToPlex?.data?.outputs?.Result_Error === true) {
                const errorMessage =
                    addedChecksheetToPlex?.data?.outputs?.Result_Message ||
                    'Unknown error';
                throw new Error(`Error adding checksheet to Plex: ${errorMessage}`);
            }
            // close out the existing control plan by marking the matching Control_Plan_Key as `Active === false` and `Complete === true`
            await updateControlPlan(req.query.checksheetId, {
                Active: false,
                Complete: true,
            });

            // get the first control plan in the Queue (the oldest createdAt)
            const firstControlPlanInQueue = await getControlPlan(req, true);

            if (firstControlPlanInQueue) {
                // and update it's state to Active
                await updateControlPlan(firstControlPlanInQueue.Control_Plan_Key, {
                    Active: true,
                });

                const plexCustomer = await getPlexCustomerByAuthType(req);
                const fullControlPlan = await getFullControlPlanDocuments(
                    req,
                    res,
                    firstControlPlanInQueue,
                    {
                        plain: true,
                    },
                );
                const validatedControlPlan = validateControlPlan(fullControlPlan); // should stop execution and throw error if invalid

                const controlPlanWithAssets = await getControlPlanAssets(
                    req,
                    plexCustomer,
                    validatedControlPlan,
                );

                return serverResponse(res, {
                    checksheetId: firstControlPlanInQueue.Control_Plan_Key,
                    workcenterCode: firstControlPlanInQueue.Workcenter_Code,
                    note: firstControlPlanInQueue.Control_Plan_Header.note,
                    checksheet: controlPlanWithAssets,
                });
            }

            return serverResponse(res, null);
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },
};
