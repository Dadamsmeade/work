import React, { useContext } from 'react';
import {
    Box,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Grid,
    Button,
    Flex,
} from '@chakra-ui/react';
import CarrierSelect from './carrierSelect';
import BillingType from './billingType';
import Billing from './billing';
import Services from './services';
import Packages from './packages';
import Address from './address';
import Rate from './rate';
import Shipment from './shipment';
import CarrierLogo from './carrierLogo';
import { ShippingContext } from '../../context/shippingContext';

const CarrierModal = ({ isOpen, onClose }) => {
    const { shippingState, dispatchShipping } = useContext(ShippingContext);
    const { selectedCarrier, selectedBillingType, modalPage } = shippingState;
    const pageTitles = [
        'Carrier',
        'Billing Type',
        'Billing',
        'Services',
        'Packages',
        'Address',
        'Rate Quote',
        'Shipment Confirmation',
    ];
    const lastPage = 7;

    const handlePaging = action => {
        let newPage = modalPage;

        if (action === 'back' && modalPage > 0) {
            dispatchShipping({ type: 'DISABLE_NEXT_BUTTON', payload: false });
            newPage = modalPage - 1;
        }

        if (
            action === 'back' &&
            modalPage === 7 &&
            selectedBillingType !== 'BILL_SHIPPER'
        ) {
            newPage = 5;
            dispatchShipping({ type: 'SET_MODAL_PAGE', payload: newPage });
            return;
        }

        if (
            action === 'next' &&
            modalPage === 5 &&
            selectedBillingType !== 'BILL_SHIPPER'
        ) {
            newPage = 7;
            dispatchShipping({ type: 'SET_MODAL_PAGE', payload: newPage });
            return;
        }

        if (action === 'next' && modalPage < lastPage) {
            newPage = modalPage + 1;
        }

        dispatchShipping({ type: 'SET_MODAL_PAGE', payload: newPage });
    };

    const getGridTemplateColumns = currentPage => {
        switch (currentPage) {
            case 0:
            case 1:
                return '1fr .5fr 1fr';
            case 2:
            case 4:
            case 5:
                return '1fr 1fr 1fr';
            case 3:
            case 7:
                return '1fr 3fr 1fr';
            case 6:
                return '1fr 1.5fr 1fr';
            default:
                return '1fr 1fr 1fr';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            isCentered
            motionPreset="slideInBottom"
            size="full"
        >
            <ModalOverlay />
            <ModalContent p={5} bg={'#335166'} maxHeight="100vh" overflowY="auto">
                <ModalBody>
                    <ModalCloseButton />
                    <ModalHeader>
                        <Flex
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                        >
                            <Box>{pageTitles[modalPage]}</Box>
                            <Box>
                                <CarrierLogo carrier={selectedCarrier} />
                            </Box>
                        </Flex>
                    </ModalHeader>

                    <Flex justifyContent="center">
                        <Button
                            colorScheme="red"
                            onClick={() => handlePaging('back')}
                            mr={4}
                            mb={4}
                            isDisabled={modalPage === 0}
                        >
                            Back
                        </Button>
                        <Button
                            colorScheme="green"
                            onClick={() => handlePaging('next')}
                            mr={4}
                            isDisabled={shippingState.isNextDisabled}
                        >
                            Next
                        </Button>
                        {/* <Button colorScheme="blue" onClick={null}>
                            Clear
                        </Button> // todo, implement reset app */}
                    </Flex>

                    <Grid templateColumns={getGridTemplateColumns(modalPage)}>
                        <Box />
                        <Box>
                            {modalPage === 0 && <CarrierSelect />}
                            {modalPage === 1 && <BillingType />}
                            {modalPage === 2 && <Billing />}
                            {modalPage === 3 && <Services />}
                            {modalPage === 4 && <Packages />}
                            {modalPage === 5 && <Address />}
                            {modalPage === 6 &&
                                selectedBillingType === 'BILL_SHIPPER' && <Rate />}
                            {modalPage === lastPage && <Shipment />}
                        </Box>
                        <Box />
                    </Grid>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default CarrierModal;
