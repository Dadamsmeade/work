const { getShipmentCharge } = require('../getShipmentCharge');

describe('getShipmentCharge', () => {
    let req;

    beforeEach(() => {
        req = {
            query: {},
            body: {},
        };
    });

    it('should return BillShipper when selectedBillingType is BILL_SHIPPER', () => {
        req.query = {
            selectedBillingType: 'BILL_SHIPPER',
            selectedAccount: '12345',
        };
        const result = getShipmentCharge(req);
        expect(result).toEqual({
            Type: '01',
            BillShipper: {
                AccountNumber: '12345',
            },
        });
    });

    it('should return BillReceiver when selectedBillingType is BILL_RECEIVER', () => {
        req.query = {
            selectedBillingType: 'BILL_RECEIVER',
            selectedBillTo: '67890',
        };
        req.body = {
            zip: '12345',
        };
        const result = getShipmentCharge(req);
        expect(result).toEqual({
            Type: '01',
            BillReceiver: {
                AccountNumber: '67890',
                Address: {
                    PostalCode: '12345',
                    CountryCode: 'US',
                },
            },
        });
    });

    it('should return BillThirdParty when selectedBillingType is BILL_THIRD_PARTY', () => {
        req.query = {
            selectedBillingType: 'BILL_THIRD_PARTY',
            selectedBillTo: '13579',
        };
        req.body = {
            zip: '54321',
        };
        const result = getShipmentCharge(req);
        expect(result).toEqual({
            Type: '01',
            BillThirdParty: {
                AccountNumber: '13579',
                Address: {
                    PostalCode: '54321',
                    CountryCode: 'US',
                },
            },
        });
    });

    it('should return undefined for unknown selectedBillingType', () => {
        req.query = {
            selectedBillingType: 'UNKNOWN_TYPE',
        };
        const result = getShipmentCharge(req);
        expect(result).toBeUndefined();
    });

    it('should handle empty zip code for BILL_RECEIVER', () => {
        req.query = {
            selectedBillingType: 'BILL_RECEIVER',
            selectedBillTo: '67890',
        };
        req.body = {
            zip: '',
        };
        const result = getShipmentCharge(req);
        expect(result.BillReceiver.Address.PostalCode).toBe('');
    });

    it('should handle empty zip code for BILL_THIRD_PARTY', () => {
        req.query = {
            selectedBillingType: 'BILL_THIRD_PARTY',
            selectedBillTo: '13579',
        };
        req.body = {
            zip: '',
        };
        const result = getShipmentCharge(req);
        expect(result.BillThirdParty.Address.PostalCode).toBe('');
    });

    it('should throw an error if req is missing', () => {
        req = null;
        expect(() => getShipmentCharge(req)).toThrow();
    });
});