const { getAddressRequest } = require('../getAddressRequest');

jest.mock('../../../../../../lib/normalize-error');

describe('getAddressRequest tests', () => {
    let req;

    beforeEach(() => {
        req = {
            body: {
                customerAddress: '123 Main St',
                city: 'Los Angeles',
                state: 'CA',
                zip: '90210',
            },
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should format the address request correctly', () => {
        const result = getAddressRequest(req);

        expect(result).toEqual({
            addressesToValidate: [
                {
                    address: {
                        streetLines: ['123 Main St', ''],
                        city: 'Los Angeles',
                        stateOrProvinceCode: 'CA',
                        postalCode: '90210',
                        countryCode: 'US',
                    },
                },
            ],
        });
    });
});
