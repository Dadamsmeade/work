const { getLabelData } = require('../getLabelData');

describe('getLabelData tests', () => {
    it('should return the correct URL and batch status for multipiece labels', () => {
        const createdShipment = {
            data: {
                output: {
                    transactionShipments: [
                        {
                            shipmentDocuments: [
                                {
                                    url: 'http://example.com/multipiece_label',
                                },
                            ],
                        },
                    ],
                },
            },
        };

        const result = getLabelData(createdShipment);

        expect(result).toEqual({
            url: 'http://example.com/multipiece_label',
            batch: true,
        });
    });

    it('should return the correct URL and batch status for single piece labels', () => {
        const createdShipment = {
            data: {
                output: {
                    transactionShipments: [
                        {
                            shipmentDocuments: null,
                            pieceResponses: [
                                {
                                    packageDocuments: [
                                        {
                                            url: 'http://example.com/single_piece_label',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            },
        };

        const result = getLabelData(createdShipment);

        expect(result).toEqual({
            url: 'http://example.com/single_piece_label',
            batch: false,
        });
    });

    it('should return undefined when no matching documents are found', () => {
        const createdShipment = {
            data: {
                output: {
                    transactionShipments: [
                        {
                            shipmentDocuments: null,
                            pieceResponses: [],
                        },
                    ],
                },
            },
        };

        const result = getLabelData(createdShipment);

        expect(result).toBeUndefined();
    });

    it('should handle null or undefined createdShipment', () => {
        let result = getLabelData(null);
        expect(result).toBeUndefined();

        result = getLabelData(undefined);
        expect(result).toBeUndefined();
    });
});
