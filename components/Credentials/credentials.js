import {
    Box,
    Button,
    Grid,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    Flex,
    Spinner,
    useDisclosure,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import React, { useState, useContext, useEffect } from 'react';
import { PlexCustomerContext } from '../../context/plexCustomerContext';
import { useRouter } from 'next/router';
import { getConnections, updateConnection } from '../../api/index';

const SecretUpdateDialog = ({
    selectedConnection,
    showNewSecret,
    newSecret,
    setNewSecret,
    handleNewSecretVisibility,
    handleSave,
    onClose,
    isLoading,
}) => {
    const [disable, setDisable] = useState(false);

    if (selectedConnection?.properties?.tags?.service === 'helios') {
        return (
            <>
                <AlertDialogBody>
                    <Flex justifyContent="center" alignItems="center" height="100%">
                        <Button
                            colorScheme="blue"
                            onClick={handleSave}
                            isDisabled={!disable}
                        >
                            Generate Secret
                        </Button>
                    </Flex>
                </AlertDialogBody>
                <AlertDialogFooter>
                    <Button onClick={onClose}>Cancel</Button>
                    {isLoading ? (
                        <Flex justifyContent="center" alignItems="center" flex={1}>
                            <Spinner />
                        </Flex>
                    ) : (
                        <Button
                            colorScheme="red"
                            onClick={setDisable}
                            ml={3}
                            isDisabled={disable}
                        >
                            I am sure I want to update my credentials.
                        </Button>
                    )}
                </AlertDialogFooter>
            </>
        );
    }

    return (
        <>
            <AlertDialogBody>
                New secret:
                <InputGroup>
                    <Input
                        pr="4.5rem"
                        type={showNewSecret ? 'text' : 'secret'}
                        value={newSecret}
                        onChange={e => setNewSecret(e.target.value)}
                    />
                    <InputRightElement width="3.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleNewSecretVisibility}>
                            <ViewIcon />
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </AlertDialogBody>

            <AlertDialogFooter>
                <Button onClick={onClose}>Cancel</Button>
                {isLoading ? (
                    <Flex justifyContent="center" alignItems="center" flex={1}>
                        <Spinner />
                    </Flex>
                ) : (
                    <Button
                        colorScheme="red"
                        onClick={handleSave}
                        ml={3}
                        isDisabled={newSecret.trim().length === 0 ?? false}
                    >
                        I am sure I want to update my credentials.
                    </Button>
                )}
            </AlertDialogFooter>
        </>
    );
};

const Credentials = () => {
    const { plexCustomerState } = useContext(PlexCustomerContext);
    const router = useRouter();
    const { connectionKey } = router.query;
    const [connections, setConnections] = useState(null);
    const [visibilityState, setVisibilityState] = useState({});
    const [showNewSecret, setShowNewSecret] = useState(false);
    const [credentialName, setCredentialName] = useState('');
    const [newSecret, setNewSecret] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedConnection, setSelectedConnection] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const toggleVisibility = name => {
        setVisibilityState(prevState => ({
            ...prevState,
            [name]: !prevState[name],
        }));
    };

    const handleNewSecretVisibility = () => setShowNewSecret(!showNewSecret);

    const handleEdit = connectionName => {
        // Find the connection object from the connections array
        const connectionObj = connections.find(
            connection => connection.properties.tags.label === connectionName,
        );
        // Set the credential name for display purposes
        setCredentialName(connectionName);
        // Set the selected connection object in state
        setSelectedConnection(connectionObj);
        // Open the dialog
        onOpen();
    };

    const handleSave = async () => {
        setIsLoading(true); // Start loading
        try {
            if (selectedConnection) {
                const body = {
                    name: selectedConnection.name,
                    value: newSecret,
                    tags: {
                        type: selectedConnection.properties.tags.type,
                        name: selectedConnection.properties.tags.name,
                        service: selectedConnection.properties.tags.service,
                        label: selectedConnection.properties.tags.label,
                    },
                };

                const updatedConnection = await updateConnection(
                    plexCustomerState,
                    connectionKey,
                    body,
                );

                const refreshedConnections = await getConnections(
                    plexCustomerState,
                    connectionKey,
                );
                setConnections(refreshedConnections.data);

                onClose(); // Close dialog
                setNewSecret(''); // Reset secret input
                setSelectedConnection(null); // Reset selected connection
            }
        } catch (error) {
            console.error('Failed to update connection:', error);
            // todo, display error message to the user
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const displaySecret = (show, secret) => (show ? secret : '*'.repeat(32));

    useEffect(() => {
        if (plexCustomerState.pcid && connectionKey) {
            getConnections(plexCustomerState, connectionKey)
                .then(response => {
                    setConnections(response.data); // TODO: this should be moved to the context file
                })
                .catch(error => console.log(error));
        }
    }, [plexCustomerState.pcid, connectionKey]);

    return (
        <Box>
            <Alert status="error" mb={4}>
                <AlertIcon />
                <AlertTitle mr={2}>Danger Zone:</AlertTitle>
                <AlertDescription>
                    Changing these settings can break your application!
                </AlertDescription>
            </Alert>

            {!connections ? (
                <Flex height="100vh" justifyContent="center" alignItems="center">
                    <Spinner />
                </Flex>
            ) : (
                <>
                    <Grid templateColumns="1fr 2fr 1fr" gap={6}>
                        {connections.map((connection, index) => {
                            const isSecretVisible =
                                visibilityState[connection.name] || false;
                            const displayedValue = displaySecret(
                                isSecretVisible,
                                connection.value,
                            );

                            return (
                                <React.Fragment key={index}>
                                    <Text>
                                        {`${connection?.properties?.tags?.label}:` || ''}
                                    </Text>
                                    <InputGroup size="md">
                                        <Input
                                            pr="4.5rem"
                                            type="text"
                                            value={displayedValue}
                                        />
                                        <InputRightElement width="4.5rem">
                                            <Button
                                                h="1.75rem"
                                                size="sm"
                                                onClick={() =>
                                                    toggleVisibility(connection.name)
                                                }
                                                data-testid="toggle-visibility-button"
                                            >
                                                {isSecretVisible ? (
                                                    <ViewOffIcon />
                                                ) : (
                                                    <ViewIcon />
                                                )}
                                            </Button>
                                        </InputRightElement>
                                    </InputGroup>
                                    {
                                        <Button
                                            onClick={() =>
                                                handleEdit(
                                                    connection.properties.tags.label,
                                                )
                                            }
                                            isDisabled={
                                                // todo, this should be a flag `disabled` or `hidden` in the Connections table
                                                connection.properties.tags.service ===
                                                    'helios' &&
                                                connection.properties.tags.type ===
                                                    'consumerKey'
                                                    ? true
                                                    : connection.properties.tags
                                                          .service === 'azureStorage' &&
                                                      connection.properties.tags.type ===
                                                          'connectionString'
                                                    ? true
                                                    : connection.properties.tags
                                                          .service === 'azureStorage' &&
                                                      connection.properties.tags.type ===
                                                          'accountKey'
                                                    ? true
                                                    : false
                                            }
                                        >
                                            Edit
                                        </Button>
                                    }
                                </React.Fragment>
                            );
                        })}
                    </Grid>

                    <AlertDialog isOpen={isOpen} onClose={onClose}>
                        <AlertDialogOverlay>
                            <AlertDialogContent>
                                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                    Update {credentialName}
                                </AlertDialogHeader>
                                <SecretUpdateDialog
                                    selectedConnection={selectedConnection}
                                    showNewSecret={showNewSecret}
                                    newSecret={newSecret}
                                    setNewSecret={setNewSecret}
                                    handleNewSecretVisibility={handleNewSecretVisibility}
                                    handleSave={handleSave}
                                    onClose={onClose}
                                    isLoading={isLoading}
                                />
                            </AlertDialogContent>
                        </AlertDialogOverlay>
                    </AlertDialog>
                </>
            )}
        </Box>
    );
};

export default Credentials;
