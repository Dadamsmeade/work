import {
    Flex,
    VStack,
    Text,
    Box,
    Grid,
    GridItem,
    Image,
    IconButton,
    HStack,
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronLeftIcon } from '@chakra-ui/icons';

import Link from 'next/link';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0/client';
import { AccountContext } from '../../context/accountContext';
import { FeatureContext } from '../../context/featureContext';
import { PlexCustomerContext } from '../../context/plexCustomerContext';
import { getAccount } from '../../api';

const Layout = ({ children }) => {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const { accountState } = useContext(AccountContext);
    const { featureState } = useContext(FeatureContext);
    const { features } = featureState;
    const { plexCustomerState } = useContext(PlexCustomerContext);
    const { dispatchAccount } = useContext(AccountContext);
    const [isCollapsed, setIsCollapsed] = useState(true);

    useEffect(() => {
        if (!isLoading && user && plexCustomerState.pcid) {
            getAccount(plexCustomerState, user)
                .then(res =>
                    dispatchAccount({
                        type: 'SET_ACCOUNT',
                        payload: res.data,
                    }),
                )
                .catch(error => console.log(error));
        }
    }, [plexCustomerState, user]);

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard' },
        ...(accountState?.account?.userRole?.Name !== 'User'
            ? [{ href: '/connections', label: 'Connections' }]
            : []),
        ...(features?.carrier ? [{ href: '/shipping', label: 'Shipping' }] : []),
        ...(features?.dynamicCheck
            ? [
                  {
                      href: '/dynamic-check',
                      label: 'Dynamic Check',
                      children: [{ href: '/dynamic-check/upload', label: 'Upload' }],
                  },
              ]
            : []),
        ...(accountState?.account?.userRole?.Name === 'SA'
            ? [{ href: '/developer', label: 'Developer' }]
            : []),
    ];

    const renderNavLinks = links => {
        return links.map(({ href, label, children }) => (
            <VStack key={href} alignItems="flex-start" width="100%">
                <Text
                    color={'blue.100'}
                    fontWeight={router.pathname === href ? 'bold' : 'normal'}
                    _hover={{ color: 'blue.300', fontWeight: 'bold' }}
                    fontSize={isCollapsed ? '0' : 'md'} // Hide text in collapsed state
                >
                    <Link href={href} passHref>
                        {label}
                    </Link>
                </Text>
                {children && (
                    <VStack pl={4} alignItems="flex-start">
                        {renderNavLinks(children)}
                    </VStack>
                )}
            </VStack>
        ));
    };

    return !isLoading && user ? (
        <Flex>
            {/* Sidebar */}
            <VStack
                w={isCollapsed ? '60px' : '200px'}
                p={4}
                h="100vh"
                spacing={6}
                alignItems="flex-start"
                style={{
                    position: 'sticky',
                    top: 0,
                    background: 'linear-gradient(to right, black, transparent)',
                }}
            >
                {/* Logo with Toggle */}
                <HStack justifyContent="space-between" w="100%" alignItems="center">
                    <Image
                        flexShrink={0}
                        src="/cumulus-logo.png"
                        alt="Your Logo"
                        mb={4}
                        display={isCollapsed ? 'none' : 'block'}
                    />
                    <IconButton
                        aria-label="Toggle sidebar"
                        icon={isCollapsed ? <HamburgerIcon /> : <ChevronLeftIcon />}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        size="lg"
                        variant="ghost"
                        colorScheme="white"
                        alignSelf="flex-start"
                    />
                </HStack>

                {/* Navigation Links */}
                <VStack
                    alignItems="flex-start"
                    spacing={3}
                    width="100%"
                    display={isCollapsed ? 'none' : 'flex'}
                >
                    {renderNavLinks(navLinks)}
                </VStack>
            </VStack>

            {/* Main Content */}
            <Box flex={1} p={0}>
                {/* Header */}
                <Box
                    backgroundColor="black"
                    style={{
                        background: 'linear-gradient(to left, gray, transparent)',
                    }}
                >
                    <Grid templateColumns="repeat(5, 1fr)" gap={4}>
                        <GridItem
                            colSpan={2}
                            h="10"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Text>{user?.email}</Text>
                        </GridItem>
                        <GridItem h="10"></GridItem>
                        <GridItem
                            h="10"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        ></GridItem>
                        <GridItem
                            h="10"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Text
                                _hover={{
                                    color: 'blue.200',
                                    fontWeight: 'bold',
                                }}
                            >
                                <Link href="/api/auth/logout">Logout</Link>
                            </Text>
                        </GridItem>
                    </Grid>
                </Box>
                {/* Page Content */}
                <Box flex={1} p={12}>
                    {children}
                </Box>
            </Box>
        </Flex>
    ) : null;
};

export default Layout;
