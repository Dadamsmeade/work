const { getShippingChargesPayment } = require('../getShippingChargesPayment');

describe('getShippingChargesPayment tests', () => {
    let req;

    beforeEach(() => {
        req = {
            query: {},
        };
    });

    it('should return paymentType SENDER for BILL_SHIPPER', () => {
        req.query.selectedBillingType = 'BILL_SHIPPER';

        const result = getShippingChargesPayment(req);

        expect(result).toEqual({
            paymentType: 'SENDER',
        });
    });

    it('should return paymentType RECIPIENT and account number for BILL_RECEIVER', () => {
        req.query.selectedBillingType = 'BILL_RECEIVER';
        req.query.selectedBillTo = '123456';

        const result = getShippingChargesPayment(req);

        expect(result).toEqual({
            paymentType: 'RECIPIENT',
            payor: {
                responsibleParty: {
                    accountNumber: { value: '123456' },
                },
            },
        });
    });

    it('should return paymentType THIRD_PARTY and account number for BILL_THIRD_PARTY', () => {
        req.query.selectedBillingType = 'BILL_THIRD_PARTY';
        req.query.selectedBillTo = '789012';

        const result = getShippingChargesPayment(req);

        expect(result).toEqual({
            paymentType: 'THIRD_PARTY',
            payor: {
                responsibleParty: {
                    accountNumber: { value: '789012' },
                },
            },
        });
    });

    it('should throw an error if an exception occurs', () => {
        req.query = null; // Simulate an error scenario

        expect(() => getShippingChargesPayment(req)).toThrow();
    });
});
