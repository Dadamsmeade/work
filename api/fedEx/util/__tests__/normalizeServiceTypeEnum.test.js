const { normalizeServiceTypeEnum } = require('../normalizeServiceTypeEnum');
const { clearConsole } = require('../../../../../../lib/test-utils');

describe('normalizeServiceTypeEnum tests', () => {
    clearConsole();
    let req;
    const serviceTypes = {
        FEDEX_GROUND: 'FEDEX_GROUND',
        FEDEX_2_DAY: 'FEDEX_2_DAY',
    };

    beforeEach(() => {
        req = {
            query: {
                selectedService: 'FEDEX_GROUND',
            },
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return the correct service type for a valid input', () => {
        const result = normalizeServiceTypeEnum(req, serviceTypes);
        expect(result).toBe('FEDEX_GROUND');
    });

    it('should return null for an invalid service type', () => {
        req.query.selectedService = 'INVALID_SERVICE';
        const result = normalizeServiceTypeEnum(req, serviceTypes);
        expect(result).toBeNull();
    });
});
