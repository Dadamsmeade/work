const { getMagentoConfig } = require('../getMagentoConfig');
const { getSecretByType } = require('../../../../../connection/services/secretService');

jest.mock('../../../../../connection/services/secretService', () => ({
    getSecretByType: jest.fn()
}));

describe('getMagentoConfig tests', () => {
    let req;

    beforeEach(() => {
        req = {
            query: {}
        };

        // mocks
        getSecretByType.mockImplementation((_, options) => {
            if (options.Access_Token) {
                return Promise.resolve({ value: 'mock-access-token' });
            }
            if (options.Base_Url) {
                return Promise.resolve({ value: 'https://base-url.com' });
            }
            return Promise.resolve(null);
        });

        jest.clearAllMocks();
    });

    it('should retrieve access token and base URL from secrets', async () => {
        const config = await getMagentoConfig(req);

        expect(getSecretByType).toHaveBeenCalledWith(req, { Access_Token: true });
        expect(getSecretByType).toHaveBeenCalledWith(req, { Base_Url: true });

        expect(config).toHaveProperty('accessToken', { value: 'mock-access-token' });
        expect(config).toHaveProperty('baseUrl', { value: 'https://base-url.com' });
        expect(config).toHaveProperty('fromDateStr');
        expect(config).toHaveProperty('toDateStr');
    });

    it('should use default date range when not provided in request', async () => {
        const realDate = Date;
        global.Date = class extends Date {
            constructor(...args) {
                if (args.length === 0) {
                    // mock current date when no arguments provided
                    return new realDate('2023-01-15T12:00:00Z');
                }
                return new realDate(...args);
            }
        };

        const config = await getMagentoConfig(req);

        expect(config.fromDateStr).toBe(new Date(2025, 0, 1).toISOString());
        expect(config.toDateStr).toBe(new Date().toISOString());

        global.Date = realDate;
    });

    it('should use date range from request query when provided', async () => {
        req.query.fromDateStr = '2024-06-01T00:00:00Z';
        req.query.toDateStr = '2024-06-30T23:59:59Z';

        const config = await getMagentoConfig(req);

        expect(config.fromDateStr).toBe('2024-06-01T00:00:00Z');
        expect(config.toDateStr).toBe('2024-06-30T23:59:59Z');
    });

    it('should throw an error when base URL is missing', async () => {
        getSecretByType.mockImplementation((_, options) => {
            if (options.Access_Token) {
                return Promise.resolve({ value: 'mock-access-token' });
            }
            if (options.Base_Url) {
                return Promise.resolve(null); // return null for Base_Url
            }
            return Promise.resolve(null);
        });

        await expect(getMagentoConfig(req))
            .rejects
            .toThrow('Missing required Magento base URL. Please configure it in Azure Key Vault.');
    });

    it('should handle malformed secret values', async () => {
        getSecretByType.mockImplementation((_, options) => {
            if (options.Access_Token) {
                return Promise.resolve({});
            }
            if (options.Base_Url) {
                return Promise.resolve({ value: 'https://base-url.com' });
            }
            return Promise.resolve(null);
        });

        const config = await getMagentoConfig(req);

        expect(config).toHaveProperty('accessToken', {});
    });

    it('should propagate errors from getSecretByType', async () => {
        const mockError = new Error('Failed to retrieve secret');
        getSecretByType.mockRejectedValue(mockError);

        await expect(getMagentoConfig(req)).rejects.toThrow('Failed to retrieve secret');
    });
});