const { combinePackages } = require('../combinePackages');

describe('combinePackages tests', () => {
    it('should combine piece responses with completed package details correctly', () => {
        const shipment = {
            pieceResponses: [
                { packageSequenceNumber: 1, label: 'label1' },
                { packageSequenceNumber: 2, label: 'label2' },
            ],
            completedShipmentDetail: {
                completedPackageDetails: [
                    { sequenceNumber: 1, detail: 'detail1' },
                    { sequenceNumber: 2, detail: 'detail2' },
                ],
            },
        };

        const result = combinePackages(shipment);

        expect(result).toEqual([
            {
                piece: { packageSequenceNumber: 1, label: 'label1' },
                completedDetail: { sequenceNumber: 1, detail: 'detail1' },
            },
            {
                piece: { packageSequenceNumber: 2, label: 'label2' },
                completedDetail: { sequenceNumber: 2, detail: 'detail2' },
            },
        ]);
    });

    it('should return null if pieceResponses is null or undefined', () => {
        const shipment = {
            pieceResponses: null,
            completedShipmentDetail: {
                completedPackageDetails: [
                    { sequenceNumber: 1, detail: 'detail1' },
                    { sequenceNumber: 2, detail: 'detail2' },
                ],
            },
        };

        const result = combinePackages(shipment);

        expect(result).toBeNull();

        const shipmentUndefined = {
            pieceResponses: undefined,
            completedShipmentDetail: {
                completedPackageDetails: [
                    { sequenceNumber: 1, detail: 'detail1' },
                    { sequenceNumber: 2, detail: 'detail2' },
                ],
            },
        };

        const resultUndefined = combinePackages(shipmentUndefined);

        expect(resultUndefined).toBeNull();
    });

    it('should handle empty pieceResponses array', () => {
        const shipment = {
            pieceResponses: [],
            completedShipmentDetail: {
                completedPackageDetails: [
                    { sequenceNumber: 1, detail: 'detail1' },
                    { sequenceNumber: 2, detail: 'detail2' },
                ],
            },
        };

        const result = combinePackages(shipment);

        expect(result).toEqual([]);
    });

    it('should throw an error if an exception occurs', () => {
        const shipment = {
            pieceResponses: {
                map: () => {
                    throw new Error('Test error');
                },
            },
            completedShipmentDetail: {
                completedPackageDetails: [
                    { sequenceNumber: 1, detail: 'detail1' },
                    { sequenceNumber: 2, detail: 'detail2' },
                ],
            },
        };

        expect(() => combinePackages(shipment)).toThrow('Test error');
    });
});
