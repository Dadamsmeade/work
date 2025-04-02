import React, { useContext } from 'react';
import { Button, Link } from '@chakra-ui/react';
import { ShippingContext } from '../../context/shippingContext';

const ShippingLabel = () => {
    const { shippingState } = useContext(ShippingContext);
    const { shipmentConfirmation, selectedImageType, shippingLabelData } = shippingState;

    const fedExConfirmation =
        shipmentConfirmation?.output?.transactionShipments?.[0]?.pieceResponses?.length ||
        null;

    if (
        (fedExConfirmation &&
            fedExConfirmation > 1 &&
            selectedImageType?.value === 'ZPLII') ||
        (fedExConfirmation &&
            fedExConfirmation > 1 &&
            selectedImageType?.value === 'EPL2')
    ) {
        return null;
    }

    if (shippingLabelData) {
        return (
            <Link href={shippingLabelData?.URL} isExternal>
                <Button colorScheme="yellow" mt={4}>
                    {shippingLabelData?.Batch ? 'Batch Labels' : 'Print Label'}
                </Button>
            </Link>
        );
    }

    return null;
};

export default ShippingLabel;
