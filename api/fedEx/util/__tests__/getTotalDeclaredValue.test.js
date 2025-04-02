const { getTotalDeclaredValue } = require('../getTotalDeclaredValue');

describe('getTotalDeclaredValue tests', () => {
    it('should return the total declared value of the packages', () => {
        const packages = [
            { Declared_Value: 100 },
            { Declared_Value: 200 },
            { Declared_Value: 150 },
        ];

        const result = getTotalDeclaredValue(packages);

        expect(result).toBe(450);
    });

    it('should return 0 if no packages are provided', () => {
        const result = getTotalDeclaredValue([]);

        expect(result).toBe(0);
    });

    it('should handle packages without Declared_Value gracefully', () => {
        const packages = [{ Declared_Value: 100 }, {}, { Declared_Value: 150 }];

        const result = getTotalDeclaredValue(packages);

        expect(result).toBe(250);
    });

    it('should throw an error if an exception occurs', () => {
        const packages = {
            reduce: () => {
                throw new Error('Test error');
            },
        };

        expect(() => getTotalDeclaredValue(packages)).toThrow('Test error');
    });
});
