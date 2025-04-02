module.exports = {
    getShipmentCharge: req => {
        const { selectedBillingType, selectedAccount, selectedBillTo } = req.query;
        const { zip } = req.body;
        if (selectedBillingType === 'BILL_SHIPPER') {
            return {
                Type: '01',
                BillShipper: {
                    AccountNumber: selectedAccount,
                },
            };
        }
        if (selectedBillingType === 'BILL_RECEIVER') {
            return {
                Type: '01',
                BillReceiver: {
                    AccountNumber: selectedBillTo,
                    Address: {
                        PostalCode: zip,
                        CountryCode: 'US',
                    },
                },
            };
        }
        if (selectedBillingType === 'BILL_THIRD_PARTY') {
            return {
                Type: '01',
                BillThirdParty: {
                    AccountNumber: selectedBillTo,
                    Address: {
                        PostalCode: zip,
                        CountryCode: 'US',
                    },
                },
            };
        }
    },
};
