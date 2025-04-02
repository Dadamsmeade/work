import React, { useEffect, useContext } from 'react';
import { ShippingContext } from '../../context/shippingContext';
import Accounts from './accounts';
import BillTos from './billTos';

const Billing = () => {
    const { shippingState, dispatchShipping } = useContext(ShippingContext);
    const { selectedAccount, selectedBillTo, selectedBillingType } = shippingState;

    useEffect(() => {
        dispatchShipping({ type: 'DISABLE_NEXT_BUTTON', payload: true });
    }, []);

    useEffect(() => {
        if (selectedBillingType === 'BILL_SHIPPER') {
            dispatchShipping({ type: 'DISABLE_NEXT_BUTTON', payload: !selectedAccount });
            return;
        }

        const bothSelected = selectedAccount && selectedBillTo;
        dispatchShipping({ type: 'DISABLE_NEXT_BUTTON', payload: !bothSelected });
    }, [selectedAccount, selectedBillTo]);

    return (
        <>
            <Accounts />
            <BillTos />
        </>
    );
};

export default Billing;
