const express = require('express');
const router = express.Router();
const {
    getControlPlanQueue,
    setControlPlan,
    setControlPlanLines,
} = require('../../controllers/public/publicTransformController');
const { schemaValidator } = require('../../../../middleware/schemaValidator');
const schemas = require('../../schemas');

/**
 * @swagger
 * /v1/transform/set-control-plan:
 *   post:
 *     summary: Queue a control plan
 *     tags:
 *       - control-plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/set-control-plan request'
 *     responses:
 *       '200':
 *         description: Measurement keys vary on Sample_Size. Tolerance_Type "Attribute" accepts Measurement boolean values 0 or 1.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/set-control-plan response'
 */
router.post('/set-control-plan', schemaValidator(schemas.setControlPlan), setControlPlan);
/**
 * @swagger
 * /v1/transform/set-control-plan-lines:
 *   post:
 *     summary: Add or update control plan measurements
 *     tags:
 *       - control-plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/set-control-plan-lines request'
 *     responses:
 *       '200':
 *         description: Measurements were updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/set-control-plan-lines response'
 */
router.post(
    '/set-control-plan-lines',
    schemaValidator(schemas.setControlPlanLines),
    setControlPlanLines,
);
/**
 * @swagger
 * /v1/transform/get-control-plan-queue:
 *   get:
 *     summary: Retrieve the control plan queue
 *     description: e.g. /v1/transform/get-control-plan-queue?workcenter=77268,77269&active=false&completed=true&skipped=false
 *     tags:
 *       - control-plan
 *     parameters:
 *       - in: query
 *         name: workcenter
 *         schema:
 *           type: string
 *         description: Comma-separated list of workcenter values (e.g. "77268,77269")
 *         example: "77268,77269"
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter for active control plans
 *         example: false
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter for completed control plans
 *         example: true
 *       - in: query
 *         name: skipped
 *         schema:
 *           type: boolean
 *         description: Filter for skipped control plans
 *         example: false
 *     responses:
 *       '200':
 *         description: Queue status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/get-control-plan-queue response'
 */
router.get(
    '/get-control-plan-queue',
    schemaValidator(schemas.getControlPlanQueue),
    getControlPlanQueue,
);

module.exports = router;
