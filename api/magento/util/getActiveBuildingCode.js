const { getBuildings } = require('../../plex');

/**
 * Retrieves the active building code with highest priority (lowest sort order)
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<string|null>} The active building code or null if none found
 */
async function getActiveBuildingCode(req, res) {
    // Get all active buildings from Plex and find the one with lowest sort_order
    // Note: this is currently the only way to fetch a buildingCode without it being hardcoded 
    // or implementing a settings screen for McGard
    const buildingsResponse = await getBuildings(req, res, { plain: true });
    let buildingCode = null;

    if (buildingsResponse && buildingsResponse.data && buildingsResponse.data.length > 0) {
        // Filter for active buildings and sort by Sort_Order
        const activeBuildings = buildingsResponse.data
            .filter(building => building.Active === 1)
            .sort((a, b) => a.Sort_Order - b.Sort_Order);

        // Get the building code from the first (highest priority) building
        buildingCode = activeBuildings.length > 0 ? activeBuildings[0].Building_Code : null;
    }

    if (!buildingCode) {
        console.warn('No active buildings found with priority sort order');
    }

    return buildingCode;
}

module.exports = {
    getActiveBuildingCode
};