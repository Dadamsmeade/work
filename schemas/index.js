const Joi = require('joi');

module.exports = {
    setControlPlan: Joi.object().keys({
        controlPlanHeader: Joi.object()
            .keys({
                workcenter: Joi.string().required(),
                controlPlanNo: Joi.string().allow(''),
                partNo: Joi.string().allow(''),
                primeOperation: Joi.string().allow(''),
                inspectionMode: Joi.string().allow(''),
                note: Joi.string().allow(''),
            })
            .or('controlPlanNo', 'partNo', 'primeOperation', 'inspectionMode')
            .required(),
    }),
    setControlPlanLines: Joi.object().keys({
        controlPlanHeader: Joi.object()
            .keys({
                workcenter: Joi.string().required(),
                note: Joi.string().allow(''),
            })
            .required(),
        controlPlanLines: Joi.array()
            .items(
                Joi.object().keys({
                    specificationDescription: Joi.string().required(),
                    specActualMeasurement: Joi.object().required(),
                }),
            )
            .min(1) // disallow empty controlPlanLines array
            .required(),
    }),
    getControlPlanQueue: Joi.object({
        workcenter: Joi.alternatives()
            .try(Joi.number(), Joi.string().pattern(/^\d+(,\d+)*$/))
            .optional(), // workcenter can be a number or a comma-delimited string of numbers
        active: Joi.boolean().optional(),
        completed: Joi.boolean().optional(),
        skipped: Joi.boolean().optional(),
    }),
};
