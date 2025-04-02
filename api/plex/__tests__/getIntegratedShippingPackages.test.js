const { getIntegratedShippingPackages } = require('../index');
const { handleWsReq } = require('../../../../../lib/handle-ws-req');
const { serverResponse } = require('../../../../../lib/server-response');
const { v4: uuidv4 } = require('uuid');
const { clearConsole } = require('../../../../../lib/test-utils');
const { getPackagingOptions } = require('../../../../../lib/get-packaging-options');

jest.mock('../../../../../lib/handle-ws-req');
jest.mock('../../../../../lib/server-response');
jest.mock('uuid');
jest.mock('../../../../../lib/get-packaging-options'); // Mock the packaging options utility

describe('getIntegratedShippingPackages tests', () => {
    clearConsole();

    const mockReq = {
        query: {
            shipperKey: '12345',
        },
    };

    const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
    };

    const mockNext = jest.fn();
    const mockConfig = {};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return packages with Declared_Value, Packaging_Type, and additional properties', async () => {
        const mockPackages = {
            data: [{ Length: 10, Width: 5, Height: 2, Weight: 1 }],
            columns: ['Length', 'Width', 'Height', 'Weight'],
        };
        const uuidValue = 'mock-uuid';
        const mockPackagingOptions = [{ label: 'Default', value: 'default' }]; // Mock packaging options

        // Mocking dependencies
        handleWsReq.mockResolvedValue(mockPackages);
        uuidv4.mockReturnValue(uuidValue);
        getPackagingOptions.mockReturnValue(mockPackagingOptions);

        await getIntegratedShippingPackages(mockReq, mockRes, mockNext, mockConfig);

        expect(handleWsReq).toHaveBeenCalledWith(
            mockReq,
            '234308',
            JSON.stringify({ inputs: { Shipper_Key: '12345' } }),
        );

        expect(serverResponse).toHaveBeenCalledWith(
            mockRes,
            {
                ...mockPackages,
                columns: [
                    'Length',
                    'Width',
                    'Height',
                    'Weight',
                    'Declared_Value',
                    'Packaging_Type',
                ],
                data: [
                    {
                        Virtual_Key: uuidValue,
                        Length: 10,
                        Width: 5,
                        Height: 2,
                        Weight: 1,
                        Declared_Value: null,
                        Packaging_Type: 'default', // Default packaging option
                    },
                ],
                selectable: {
                    packagingOptions: mockPackagingOptions, // The selectable dropdown options
                },
                editable: ['Length', 'Width', 'Height', 'Weight', 'Declared_Value'],
            },
            mockConfig,
        );
    });

    it('should handle errors', async () => {
        const error = new Error('Test error');
        handleWsReq.mockRejectedValue(error);

        await getIntegratedShippingPackages(mockReq, mockRes, mockNext, mockConfig);

        expect(mockNext).toHaveBeenCalledWith(error);
    });
});
