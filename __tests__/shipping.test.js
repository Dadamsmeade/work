import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { FeatureContext } from '../context/featureContext';
import Shipping from '../pages/shipping';

jest.mock('@auth0/nextjs-auth0/client');
jest.mock('../api');
// mock anything router uses e.g. router.push()
jest.mock('next/router', () => ({
    useRouter() {
        return {
            route: '/',
            pathname: '',
            query: '',
            asPath: '',
            push: jest.fn(),
            events: {
                on: jest.fn(),
                off: jest.fn(),
            },
            beforePopState: jest.fn(() => null),
            prefetch: jest.fn(() => null),
            replace: jest.fn(),
        };
    },
}));

describe('Shipping Tests', () => {
    it.skip('renders header', async () => {
        // todo: redo tests as HELI-84 implementation develops
        useUser.mockReturnValue({
            user: {},
            isLoading: false,
        });

        const featureState = {
            plexCustomerApis: [{ Feature: { Name: 'carrier' } }],
        };

        render(
            <FeatureContext.Provider value={{ featureState }}>
                <Shipping />
            </FeatureContext.Provider>,
        );
    });
});
