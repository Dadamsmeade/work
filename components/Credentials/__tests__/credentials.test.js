import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Credentials from '../credentials';
import { PlexCustomerContext } from '../../../context/plexCustomerContext';
import { getConnections, updateConnection } from '../../../api/index';

jest.mock('next/router', () => ({
    useRouter: () => ({
        query: { connectionKey: 'testConnectionKey' },
    }),
}));

jest.mock('../../../api/index', () => ({
    getConnections: jest.fn(),
    updateConnection: jest.fn(),
}));

const mockPlexCustomerState = {
    pcid: 'testPcid',
};

const mockConnections = [
    {
        name: 'testConnection',
        value: 'testSecret',
        properties: {
            tags: {
                label: 'Test Connection',
                type: 'test',
                name: 'test',
                service: 'test',
            },
        },
    },
];

describe('Credentials Component', () => {
    beforeEach(() => {
        getConnections.mockResolvedValue({ data: mockConnections });
    });

    it('renders spinner when connections are null', () => {
        render(
            <PlexCustomerContext.Provider
                value={{ plexCustomerState: mockPlexCustomerState }}
            >
                <Credentials />
            </PlexCustomerContext.Provider>,
        );
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders connections when data is loaded', async () => {
        render(
            <PlexCustomerContext.Provider
                value={{ plexCustomerState: mockPlexCustomerState }}
            >
                <Credentials />
            </PlexCustomerContext.Provider>,
        );

        await waitFor(() => {
            expect(screen.getByText('Test Connection:')).toBeInTheDocument();
        });
    });

    it('toggles secret visibility when view button is clicked', async () => {
        render(
            <PlexCustomerContext.Provider
                value={{ plexCustomerState: mockPlexCustomerState }}
            >
                <Credentials />
            </PlexCustomerContext.Provider>,
        );

        await waitFor(() => {
            expect(screen.getByText('Test Connection:')).toBeInTheDocument();
        });

        const viewButton = screen.getByTestId('toggle-visibility-button');
        fireEvent.click(viewButton);

        expect(screen.getByDisplayValue('testSecret')).toBeInTheDocument();
    });

    it('opens edit dialog when edit button is clicked', async () => {
        render(
            <PlexCustomerContext.Provider
                value={{ plexCustomerState: mockPlexCustomerState }}
            >
                <Credentials />
            </PlexCustomerContext.Provider>,
        );

        await waitFor(() => {
            expect(screen.getByText('Test Connection:')).toBeInTheDocument();
        });

        const editButton = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editButton);

        expect(screen.getByText('Update Test Connection')).toBeInTheDocument();
    });

    it('updates connection when new secret is submitted', async () => {
        updateConnection.mockResolvedValue({});
        getConnections
            .mockResolvedValueOnce({ data: mockConnections })
            .mockResolvedValueOnce({
                data: [{ ...mockConnections[0], value: 'newTestSecret' }],
            });

        render(
            <PlexCustomerContext.Provider
                value={{ plexCustomerState: mockPlexCustomerState }}
            >
                <Credentials />
            </PlexCustomerContext.Provider>,
        );

        await waitFor(() => {
            expect(screen.getByText('Test Connection:')).toBeInTheDocument();
        });

        const editButton = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editButton);

        const newSecretInput = screen.getByRole('textbox');
        fireEvent.change(newSecretInput, { target: { value: 'newTestSecret' } });

        const updateButton = screen.getByRole('button', {
            name: /I am sure I want to update my credentials/i,
        });
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(updateConnection).toHaveBeenCalledWith(
                mockPlexCustomerState,
                'testConnectionKey',
                expect.objectContaining({
                    value: 'newTestSecret',
                }),
            );
        });

        await waitFor(() => {
            expect(screen.queryByText('Update Test Connection')).not.toBeInTheDocument();
        });
    });
});
