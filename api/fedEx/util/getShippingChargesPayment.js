module.exports = {
    getShippingChargesPayment: req => {
        const { selectedBillingType, selectedBillTo } = req.query;

        if (selectedBillingType === 'BILL_SHIPPER') {
            return {
                paymentType: 'SENDER',
            };
        }

        if (selectedBillingType === 'BILL_RECEIVER') {
            return {
                paymentType: 'RECIPIENT',
                payor: {
                    responsibleParty: {
                        accountNumber: { value: selectedBillTo },
                    },
                },
            };
        }
        if (selectedBillingType === 'BILL_THIRD_PARTY') {
            return {
                paymentType: 'THIRD_PARTY',
                payor: {
                    responsibleParty: {
                        accountNumber: { value: selectedBillTo },
                    },
                },
            };
        }
    },
};
