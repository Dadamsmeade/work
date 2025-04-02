const { getActiveBuildingCode } = require('../getActiveBuildingCode');
const { getBuildings } = require('../../../plex');

jest.mock('../../../plex', () => ({
    getBuildings: jest.fn(),
}));

describe('getActiveBuildingCode tests', () => {
    let req, res;

    beforeEach(() => {
        req = { query: {} };
        res = { status: jest.fn(() => res), json: jest.fn() };

        jest.clearAllMocks();
    });

    it('should return the building code with highest priority (lowest sort order)', async () => {
        getBuildings.mockResolvedValue({
            data: [
                { Building_Code: 'BC1', Active: 1, Sort_Order: 20 },
                { Building_Code: 'BC2', Active: 1, Sort_Order: 10 }, // Should be selected (lowest Sort_Order)
                { Building_Code: 'BC3', Active: 0, Sort_Order: 5 },  // Inactive, should be ignored
                { Building_Code: 'BC4', Active: 1, Sort_Order: 30 },
            ]
        });

        const result = await getActiveBuildingCode(req, res);

        expect(getBuildings).toHaveBeenCalledWith(req, res, { plain: true });
        expect(result).toBe('BC2');
    });

    it('should handle when no active buildings exist', async () => {
        getBuildings.mockResolvedValue({
            data: [
                { Building_Code: 'BC1', Active: 0, Sort_Order: 20 },
                { Building_Code: 'BC2', Active: 0, Sort_Order: 10 },
            ]
        });

        const result = await getActiveBuildingCode(req, res);

        expect(getBuildings).toHaveBeenCalledWith(req, res, { plain: true });
        expect(result).toBeNull();
    });

    it('should handle empty buildings array', async () => {
        getBuildings.mockResolvedValue({
            data: []
        });

        const result = await getActiveBuildingCode(req, res);

        expect(getBuildings).toHaveBeenCalledWith(req, res, { plain: true });
        expect(result).toBeNull();
    });

    it('should handle undefined or malformed response', async () => {
        getBuildings.mockResolvedValue(undefined);

        const result = await getActiveBuildingCode(req, res);
        expect(result).toBeNull();
    });

    it('should log a warning when no active buildings are found', async () => {
        // Spy on console.warn
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        getBuildings.mockResolvedValue({
            data: [
                { Building_Code: 'BC1', Active: 0, Sort_Order: 20 },
            ]
        });

        await getActiveBuildingCode(req, res);

        expect(consoleSpy).toHaveBeenCalledWith('No active buildings found with priority sort order');
        consoleSpy.mockRestore();
    });

    it('should propagate errors from getBuildings', async () => {
        const mockError = new Error('Failed to get buildings');
        getBuildings.mockRejectedValue(mockError);

        await expect(getActiveBuildingCode(req, res)).rejects.toThrow('Failed to get buildings');
    });
});