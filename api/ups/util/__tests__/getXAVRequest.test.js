const { getXAVRequest } = require('../getXAVRequest');

describe('getXAVRequest', () => {
    let req;

    beforeEach(() => {
        req = {
            body: {
                customerName: 'CUST123',
                customerAddress: '123 Street',
                city: 'Los Angeles',
                state: 'CA',
                zip: '12345',
            },
        };
    });

    it('should return a correctly formatted XAVRequest object', () => {
        const result = getXAVRequest(req);
        expect(result).toEqual({
            XAVRequest: {
                AddressKeyFormat: {
                    ConsigneeName: 'CUST123',
                    AddressLine: '123 Street',
                    PoliticalDivision2: 'Los Angeles',
                    PoliticalDivision1: 'CA',
                    PostcodePrimaryLow: '12345',
                    PostcodeExtendedLow: '',
                    Urbanization: '',
                    CountryCode: 'US',
                },
            },
        });
    });

    it('should handle ZIP code with extension', () => {
        req.body.zip = '12345-6789';
        const result = getXAVRequest(req);
        expect(result.XAVRequest.AddressKeyFormat.PostcodePrimaryLow).toBe('12345');
        expect(result.XAVRequest.AddressKeyFormat.PostcodeExtendedLow).toBe('6789');
    });

    it('should handle ZIP code without extension', () => {
        req.body.zip = '12345';
        const result = getXAVRequest(req);
        expect(result.XAVRequest.AddressKeyFormat.PostcodePrimaryLow).toBe('12345');
        expect(result.XAVRequest.AddressKeyFormat.PostcodeExtendedLow).toBe('');
    });

    it('should throw an error if required fields are missing', () => {
        req.body = {};
        expect(() => getXAVRequest(req)).toThrow();
    });

    it('should handle empty string values', () => {
        req.body = {
            customerName: '',
            customerAddress: '',
            city: '',
            state: '',
            zip: '',
        };
        const result = getXAVRequest(req);
        expect(result.XAVRequest.AddressKeyFormat.ConsigneeName).toBe('');
        expect(result.XAVRequest.AddressKeyFormat.AddressLine).toBe('');
        expect(result.XAVRequest.AddressKeyFormat.PoliticalDivision2).toBe('');
        expect(result.XAVRequest.AddressKeyFormat.PoliticalDivision1).toBe('');
        expect(result.XAVRequest.AddressKeyFormat.PostcodePrimaryLow).toBe('');
        expect(result.XAVRequest.AddressKeyFormat.PostcodeExtendedLow).toBe('');
    });
});
