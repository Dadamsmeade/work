const db = require('../../../models');
const { Op } = require('sequelize');

module.exports = {
    // Attempt to find an existing active checksheet or create a new one
    createControlPlan: async (req, plexCustomer, workcenterExists) => {
        const { controlPlanHeader } = req.body;
        const { workcenter } = controlPlanHeader;

        const [activeChecksheet, created] = await db.Control_Plan.findOrCreate({
            where: {
                PCID: plexCustomer.PCID,
                Workcenter_Key: workcenter,
                Active: true,
            },
            defaults: {
                Workcenter_Key: workcenter,
                Workcenter_Code: workcenterExists.data[0].Workcenter_Code,
                Control_Plan_Header: controlPlanHeader,
                Active: true,
                PCID: plexCustomer.PCID,
            },
        });

        if (created) return activeChecksheet;

        // else create a new inactive one
        const inactiveChecksheet = await db.Control_Plan.create({
            Workcenter_Key: workcenter,
            Control_Plan_Header: controlPlanHeader,
            Workcenter_Code: workcenterExists.data[0].Workcenter_Code,
            Active: false, // Since we already had an active one, mark new as inactive
            PCID: plexCustomer.PCID,
        });

        return inactiveChecksheet;
    },

    getControlPlanQueue: async (req, plexCustomer) => {
        let { workcenter, active, completed, skipped } = req.query;

        // If workcenter is provided as a comma-delimited list, convert it to an array.
        let workcenters;
        if (workcenter) workcenters = workcenter.split(',').map(w => w.trim());

        const whereClause = {
            PCID: plexCustomer.PCID,
        };
        if (workcenters) whereClause.Workcenter_Key = { [Op.in]: workcenters };
        if (active !== undefined) whereClause.Active = active;
        if (completed !== undefined) whereClause.Complete = completed;
        if (skipped !== undefined) whereClause.Skip = skipped;

        const controlPlans = await db.Control_Plan.findAll({
            where: whereClause,
            order: [
                ['Workcenter_Key', 'ASC'],
                ['Active', 'DESC'],
                ['createdAt', 'ASC'],
            ],
        });

        return controlPlans;
    },

    getControlPlan: async (req, firstInQueue = false, plexCustomer = null) => {
        const whereCondition = {
            PCID: req.params.pcid || plexCustomer.PCID,
            Workcenter_Key: req.query.workcenter || req.body.controlPlanHeader.workcenter,
            ...(firstInQueue
                ? { Complete: false, Skip: false }
                : { Active: req.query.active }),
        };

        return await db.Control_Plan.findOne({
            where: whereCondition,
            include: [{ model: db.Control_Plan_Line }],
            order: firstInQueue && [['createdAt', 'ASC']],
        });
    },

    updateControlPlan: async (checksheetId, updateFields) => {
        const [matchedCount] = await db.Control_Plan.update(updateFields, {
            where: { Control_Plan_Key: checksheetId },
        });

        return matchedCount;
    },

    updateControlPlanHeader: async (controlPlan, partialHeader) => {
        // header with only keys that have a defined value
        const validHeader = Object.fromEntries(
            Object.entries(partialHeader).filter(([key, value]) => value !== undefined),
        );

        // Only update if there are any valid keys to merge
        if (Object.keys(validHeader).length > 0) {
            controlPlan.Control_Plan_Header = {
                ...controlPlan.Control_Plan_Header,
                ...validHeader,
            };
            await controlPlan.save();
        }
        return controlPlan;
    },

    updateNextInQueue: async () => {
        const nextInQueue = await db.Control_Plan.findOne({
            where: { Active: false, Skip: false, Complete: false },
            order: [['createdAt', 'ASC']], // Oldest first
        });

        if (nextInQueue) {
            const [matchedCountActive] = await db.Control_Plan.update(
                { Active: true },
                {
                    where: { Control_Plan_Key: nextInQueue.Control_Plan_Key },
                },
            );
            return matchedCountActive;
        }

        return nextInQueue;
    },

    // by default, delete all inactive control plans older than one week
    purgeControlPlans: async (plexCustomer, timeFrameInMinutes = 7 * 24 * 60) => {
        const cutoffDate = new Date(Date.now() - timeFrameInMinutes * 60 * 1000);
        const deletedCount = await db.Control_Plan.destroy({
            where: {
                PCID: plexCustomer.PCID,
                Active: false,
                createdAt: {
                    [Op.lt]: cutoffDate,
                },
            },
        });

        return deletedCount;
    },
};
