import React, { createContext, useReducer, useEffect, useState } from 'react';
import plexCustomerReducer from '../reducers/plexCustomerReducer';
import { useUser } from '@auth0/nextjs-auth0/client';
import { getPlexCustomer } from '../api';
import { Flex, Box, Spinner } from '@chakra-ui/react';
import { getSessionToken } from '../lib/get-session-token';
import { useRouter } from 'next/router';

const initialState = {
    pcid: null,
    integrationPUN: null,
    name: '',
    active: null,
    sessionToken: '',
    plexCustomerApis: null,
    preferences: null,
};

export const PlexCustomerContext = createContext(initialState);

export const PlexCustomerProvider = props => {
    const [plexCustomerState, dispatchPlexCustomer] = useReducer(
        plexCustomerReducer,
        initialState,
    );
    const { user, error, isLoading } = useUser();
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);

    // useEffect(() => {
    //     if (!isLoading && !user && !isRedirecting) {
    //         setIsRedirecting(true);
    //         router.push('/').catch(() => setIsRedirecting(false));
    //     }
    // }, [isLoading, user, isRedirecting, router]);

    useEffect(() => {
        if (user) {
            getSessionToken()
                .then(sessionToken => {
                    dispatchPlexCustomer({
                        type: 'SET_SESSION_TOKEN',
                        payload: sessionToken,
                    });
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }, [user]);

    useEffect(() => {
        if (user && plexCustomerState.sessionToken) {
            const fetchCustomer = async () => {
                try {
                    const res = await getPlexCustomer(user.email, plexCustomerState);
                    dispatchPlexCustomer({
                        type: 'SET_PLEX_CUSTOMER_DATA',
                        payload: res.data.plexCustomer,
                    });
                } catch (err) {
                    console.error('Error fetching account:', err);
                    if (!isRedirecting) {
                        setIsRedirecting(true);
                        router
                            .push('/api/auth/logout')
                            .catch(() => setIsRedirecting(false));
                    }
                }
            };

            fetchCustomer();
        }
    }, [user, plexCustomerState.sessionToken, isRedirecting, router]);

    return isLoading || isRedirecting ? (
        <Flex height="100vh" justifyContent="center" alignItems="center">
            <Spinner />
        </Flex>
    ) : error ? (
        <Box>{error.message}</Box>
    ) : (
        <PlexCustomerContext.Provider value={{ plexCustomerState, dispatchPlexCustomer }}>
            {props.children}
        </PlexCustomerContext.Provider>
    );
};
