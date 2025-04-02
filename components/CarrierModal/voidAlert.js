import React, { useContext } from 'react';
import {
    Button,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react';
import { ShippingContext } from '../../context/shippingContext';

const VoidAlert = ({ onConfirm }) => {
    const { shippingState, dispatchShipping } = useContext(ShippingContext);
    const { isVoidConfirmOpen } = shippingState;

    const handleClose = () => {
        dispatchShipping({
            type: 'SET_IS_VOID_CONFIRM_OPEN',
            payload: false,
        });
    };

    return (
        <AlertDialog isOpen={isVoidConfirmOpen} onClose={handleClose}>
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Void Shipment
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        Are you sure? You can't undo this action afterwards.
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button
                            colorScheme="red"
                            onClick={() => {
                                dispatchShipping({
                                    type: 'SET_VOIDING_SHIPMENT',
                                    payload: true,
                                });
                                onConfirm();
                                handleClose();
                            }}
                            ml={3}
                        >
                            Confirm
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
};

export default VoidAlert;
