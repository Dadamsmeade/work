import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PlexCustomerContext } from '../../../context/plexCustomerContext';
import { ShippingContext } from '../../../context/shippingContext';
import CarrierModal from '../index';
import * as api from '../../../api/index';
import '@testing-library/jest-dom';
import { mockPlexCustomerState } from '../../../mockData/index.js';

jest.mock('next/router', () => ({
    useRouter: () => ({
        query: { shipperKey: '8428808' },
    }),
}));

jest.mock('../../../api/index', () => ({
    getIntegratedShippingPackages: jest.fn(),
}));

jest.mock('../carrierLayout', () => ({ children }) => <div>{children}</div>);

jest.mock('../../DataTable/dataTable', () => {
    return function MockDataTable({ data, columns }) {
        return (
            <div>
                {data.map((row, index) => (
                    <tr key={index}>
                        {columns.map(column => (
                            <td key={column.accessorKey}>{row[column.accessorKey]}</td>
                        ))}
                    </tr>
                ))}
            </div>
        );
    };
});

describe('Packages component', () => {
    const mockPackages = {
        columns: [
            'Serial_No',
            'Container_Type',
            'Length',
            'Width',
            'Height',
            'Weight',
            'Packaging_Type',
        ],
        data: [
            {
                Serial_No: 'PKG001',
                Container_Type: 'Box',
                Length: 10,
                Width: 11,
                Height: 12,
                Weight: 5,
                Packaging_Type: 'Default',
            },
        ],
        selectable: {
            packagingOptions: [
                { label: 'Default', value: { val: '00', desc: 'UNKNOWN' } },
                { label: 'UPS Letter', value: { val: '01', desc: 'UPS Letter' } },
                { label: 'Package', value: { val: '02', desc: 'Package' } },
                { label: 'Pak', value: { val: '04', desc: 'Pak' } },
            ],
        },
    };

    const mockShippingState = {
        modalPage: 4,
        packages: null,
        selectedPackages: [],
        selectedCarrier: { Settings: { colors: { secondary: 'blue' } } },
    };

    beforeEach(() => {
        api.getIntegratedShippingPackages.mockReset();
    });

    const renderWithContext = (shippingState = mockShippingState) => {
        return render(
            <PlexCustomerContext.Provider
                value={{ plexCustomerState: mockPlexCustomerState }}
            >
                <ShippingContext.Provider
                    value={{ shippingState, dispatchShipping: jest.fn() }}
                >
                    <CarrierModal isOpen={true} onClose={() => {}} />
                </ShippingContext.Provider>
            </PlexCustomerContext.Provider>,
        );
    };

    it('renders the packages component correctly', async () => {
        api.getIntegratedShippingPackages.mockResolvedValue({ data: mockPackages });

        const updatedState = {
            ...mockShippingState,
            packages: mockPackages,
        };

        renderWithContext(updatedState);

        await waitFor(() => {
            expect(screen.getByText('Package Details')).toBeInTheDocument();
            expect(screen.getByText('PKG001')).toBeInTheDocument();
            expect(screen.getByText('Box')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument(); // Length
            expect(screen.getByText('5')).toBeInTheDocument(); // Weight
        });
    });

    it('displays error message when package fetching fails', async () => {
        api.getIntegratedShippingPackages.mockRejectedValue(
            new Error('Failed to fetch packages'),
        );

        renderWithContext();

        await waitFor(() => {
            expect(screen.getByText('Failed to load packages.')).toBeInTheDocument();
        });
    });

    it('renders loading initially', async () => {
        api.getIntegratedShippingPackages.mockImplementation(() => new Promise(() => {})); // Never resolves

        renderWithContext();

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
});
