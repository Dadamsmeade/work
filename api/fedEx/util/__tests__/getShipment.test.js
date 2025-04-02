const axios = require('axios');
const { serverResponse } = require('../../../../../../lib/server-response');
const { getShipmentRequest } = require('../getShipmentRequest');
const { getToken } = require('../getToken');
const { combinePackages } = require('../combinePackages');
const { getShipment } = require('../getShipment');
const { clearConsole } = require('../../../../../../lib/test-utils');

jest.mock('axios');
jest.mock('../../../../../../lib/server-response');
jest.mock('../getShipmentRequest');
jest.mock('../getToken');
jest.mock('../combinePackages');

describe('getShipment tests', () => {
    clearConsole();
    let req, res, next, config;

    beforeEach(() => {
        req = {
            body: {},
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        config = {};

        getShipmentRequest.mockResolvedValue('mocked_shipment_request');
        getToken.mockResolvedValue('mocked_token');
        axios.post.mockResolvedValue({
            data: {
                output: {
                    transactionShipments: [
                        {
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
                        },
                    ],
                },
            },
        });
        combinePackages.mockImplementation(shipment => {
            return (
                shipment?.pieceResponses?.map(piece => {
                    const completedDetail =
                        shipment?.completedShipmentDetail?.completedPackageDetails?.find(
                            detail =>
                                detail?.sequenceNumber === piece?.packageSequenceNumber,
                        );
                    return { piece, completedDetail };
                }) || null
            );
        });
        serverResponse.mockImplementation((res, data) => res.json(data));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create the shipment and respond with the result', async () => {
        await getShipment(req, res, next, config);

        expect(getShipmentRequest).toHaveBeenCalledWith(req, res, next, config);
        expect(getToken).toHaveBeenCalledWith(req);
        expect(axios.post).toHaveBeenCalledWith(
            'https://apis.fedex.com/ship/v1/shipments',
            'mocked_shipment_request',
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-locale': 'en_US',
                    Authorization: 'Bearer mocked_token',
                },
            },
        );
        expect(combinePackages).toHaveBeenCalledWith({
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
        });
        expect(serverResponse).toHaveBeenCalledWith(
            res,
            {
                data: {
                    output: {
                        transactionShipments: [
                            {
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
                            },
                        ],
                    },
                    combinedPackages: [
                        {
                            piece: {
                                packageSequenceNumber: 1,
                                label: 'label1',
                            },
                            completedDetail: {
                                sequenceNumber: 1,
                                detail: 'detail1',
                            },
                        },
                        {
                            piece: {
                                packageSequenceNumber: 2,
                                label: 'label2',
                            },
                            completedDetail: {
                                sequenceNumber: 2,
                                detail: 'detail2',
                            },
                        },
                    ],
                },
            },
            config,
        );
    });
});
