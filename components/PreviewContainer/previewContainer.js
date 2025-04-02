import React, { useContext } from 'react';
import { Box, Flex, Text, Icon, Button } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { DynamicCheckContext } from '../../context/dynamicCheckContext';
import PreviewDocumentSelect from '../PreviewDocumentSelect/previewDocumentSelect';

const PreviewContainer = () => {
    const { dynamicCheckState, dispatchDynamicCheck } = useContext(DynamicCheckContext);
    const {
        checksheet,
        previewUrl,
        previewFileType,
        selectedRowIndex,
        activeDocIndex,
        activeDocSource,
    } = dynamicCheckState;
    const { data } = checksheet;
    const activeDocs = data?.[selectedRowIndex]?.Control_Plan_Line_Documents;
    // Determine if there are any documents available
    const hasDocs = activeDocs && Array.isArray(activeDocs) && activeDocs?.length > 0;

    // Set cursor to pointer only if there is a preview or available document.
    const cursorStyle = previewUrl || previewUrl ? 'pointer' : 'default';
    const color = hasDocs ? 'blue.300' : 'gray.500';

    const handleClick = () => {
        if (!hasDocs && !previewUrl) return;

        if (previewUrl) {
            dispatchDynamicCheck({
                type: 'SET_MODAL_IS_OPEN',
                payload: true,
            });
        }
    };

    return (
        <>
            {/* Dropdown container with spacing */}
            <Box mb={4}>
                <PreviewDocumentSelect />
            </Box>

            {/* Navigation controls (only shown if more than one active document exists, the source is "Measurement" and a preview is loaded) */}
            {Array.isArray(activeDocs) &&
                activeDocs?.length > 1 &&
                activeDocSource === 'Measurement' &&
                previewUrl && (
                    <Flex justifyContent="center" alignItems="center" mt={2}>
                        <Button
                            onClick={() => {
                                if (activeDocIndex === 0) return;
                                const newIndex = activeDocIndex - 1;
                                const newDoc = activeDocs[newIndex];

                                dispatchDynamicCheck({
                                    type: 'SET_ACTIVE_DOCUMENT',
                                    payload: {
                                        activeDocIndex: newIndex,
                                        previewFileType: newDoc ? newDoc.contentType : '',
                                        previewUrl: newDoc ? newDoc.url : '',
                                    },
                                });
                            }}
                            disabled={activeDocIndex === 0}
                            mr={2}
                        >
                            Previous
                        </Button>
                        <Text>
                            {activeDocIndex + 1} of {activeDocs.length}
                        </Text>
                        <Button
                            onClick={() => {
                                if (activeDocIndex === activeDocs.length - 1) return;
                                const newIndex = activeDocIndex + 1;
                                const newDoc = activeDocs[newIndex];

                                dispatchDynamicCheck({
                                    type: 'SET_ACTIVE_DOCUMENT',
                                    payload: {
                                        activeDocIndex: newIndex,
                                        previewFileType: newDoc ? newDoc.contentType : '',
                                        previewUrl: newDoc ? newDoc.url : '',
                                    },
                                });
                            }}
                            disabled={activeDocIndex === activeDocs.length - 1}
                            ml={2}
                        >
                            Next
                        </Button>
                    </Flex>
                )}

            <Box
                borderRadius="md"
                bg="#192126"
                height="calc(100vh - 6rem)"
                overflow="auto"
                position="relative"
                onClick={handleClick}
                cursor={cursorStyle}
                border="1px solid"
                borderColor="transparent"
                _hover={previewUrl ? { borderColor: color } : {}}
            >
                {previewUrl ? (
                    <>
                        {previewFileType === 'application/pdf' ? (
                            <iframe
                                src={previewUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                }}
                            />
                        ) : previewFileType === 'image/png' ? (
                            <img
                                src={previewUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                }}
                            />
                        ) : previewFileType === 'image/gif' ? (
                            <img
                                src={previewUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                }}
                            />
                        ) : previewFileType === 'image/jpeg' ? (
                            <img
                                src={previewUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                }}
                            />
                        ) : previewFileType === 'image/jpg' ? (
                            <img
                                src={previewUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                }}
                            />
                        ) : (
                            // render everything else as iframe
                            <iframe
                                src={previewUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                }}
                            />
                        )}
                        <Box
                            position="absolute"
                            top="0"
                            left="0"
                            right="0"
                            bottom="0"
                            zIndex={2}
                            backgroundColor="transparent"
                            style={{ touchAction: 'pan-y' }}
                        />
                    </>
                ) : (
                    <Flex
                        height="100%"
                        direction="column"
                        align="center"
                        justify="center"
                        color="gray.500"
                        textAlign="center"
                        p={4}
                        role="group" // This makes the Flex container a hover group.
                    >
                        <Icon as={SearchIcon} boxSize={8} mb={4} />
                    </Flex>
                )}
            </Box>
        </>
    );
};

export default PreviewContainer;
