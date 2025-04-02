const { helios } = require('../../api');

module.exports = {
    getControlPlanQueue: helios.getControlPlanQueue,
    setControlPlan: helios.setControlPlan,
    setControlPlanLines: helios.setControlPlanLines,
};
