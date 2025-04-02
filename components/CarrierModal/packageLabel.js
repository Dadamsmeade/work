import React, { useContext } from 'react';
import { Button, Link } from '@chakra-ui/react';
import { ShippingContext } from '../../context/shippingContext';

const PrintLabel = ({ packageDetail }) => {
    const { shippingState } = useContext(ShippingContext);
    const { shipmentConfirmation } = shippingState;
    const { packageDocuments } = packageDetail;

    if (
        shipmentConfirmation?.output?.transactionShipments?.[0].pieceResponses?.length ===
        1
    )
        return null;

    return (
        <>
            <Link href={packageDocuments?.[0]?.url} isExternal>
                <Button colorScheme="yellow" mt={4}>
                    Print Label
                </Button>
            </Link>
        </>
    );
};
export default PrintLabel;
