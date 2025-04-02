import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataTable from '../dataTable';

jest.mock('next/link', () => {
    return ({ children, href }) => {
        return <a href={href}>{children}</a>;
    };
});

describe('DataTable', () => {
    const mockData = [
        {
            id: 1,
            name: 'John',
            age: 25,
            Shipper_No: 'SH001',
            Shipper_Key: 'KEY001',
            Label: 'Label1',
            Service: 'Service1',
        },
        {
            id: 2,
            name: 'Jane',
            age: 30,
            Shipper_No: 'SH002',
            Shipper_Key: 'KEY002',
            Label: 'Label2',
            Service: 'Service2',
        },
    ];

    const mockColumns = [
        { header: 'Name', accessorKey: 'name' },
        { header: 'Age', accessorKey: 'age', meta: { isNumeric: true } },
        { header: 'Shipper No', accessorKey: 'Shipper_No' },
        { header: 'Label', accessorKey: 'Label' },
    ];

    const mockOnInputChange = jest.fn();
    const mockOnRowSelect = jest.fn();
    const mockDispatch = jest.fn();

    const defaultProps = {
        data: mockData,
        columns: mockColumns,
        onInputChange: mockOnInputChange,
        onRowSelect: mockOnRowSelect,
        dispatch: mockDispatch,
    };

    it('renders the table with valid data and columns', () => {
        render(<DataTable {...defaultProps} />);

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Age')).toBeInTheDocument();
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('renders the error alert when data is empty', () => {
        render(<DataTable {...defaultProps} data={[]} />);

        expect(screen.getByText('No records found.')).toBeInTheDocument();
    });

    it('sorts the table when a column header is clicked', () => {
        render(<DataTable {...defaultProps} />);

        fireEvent.click(screen.getByText('Age'));

        expect(screen.getAllByRole('row')[1]).toHaveTextContent('Jane');
        expect(screen.getAllByRole('row')[2]).toHaveTextContent('John');

        fireEvent.click(screen.getByText('Age'));

        expect(screen.getAllByRole('row')[1]).toHaveTextContent('John');
        expect(screen.getAllByRole('row')[2]).toHaveTextContent('Jane');
    });

    it('calls handleInputChange when input changes', () => {
        render(<DataTable {...defaultProps} editable={['name', 'age']} />);

        const input = screen.getByDisplayValue('John');
        fireEvent.change(input, { target: { value: 'Johnny' } });

        expect(mockOnInputChange).toHaveBeenCalled();
    });

    it('renders pagination controls when pagination prop is true', () => {
        render(<DataTable {...defaultProps} pagination={true} />);

        expect(screen.getByText('First')).toBeInTheDocument();
        expect(screen.getByText('Previous')).toBeInTheDocument();
        expect(screen.getByText('Next')).toBeInTheDocument();
        expect(screen.getByText('Last')).toBeInTheDocument();
    });

    it('renders filter input when filterColumns prop is true', () => {
        render(<DataTable {...defaultProps} filterColumns={true} />);

        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('filters data when search input is used', async () => {
        render(<DataTable {...defaultProps} filterColumns={true} />);

        const searchInput = screen.getByPlaceholderText('Search...');
        fireEvent.change(searchInput, { target: { value: 'John' } });

        await waitFor(() => {
            expect(screen.getByText('John')).toBeInTheDocument();
            expect(screen.queryByText('Jane')).not.toBeInTheDocument();
        });
    });

    it('renders links for Shipper_No and Label columns', () => {
        render(<DataTable {...defaultProps} />);

        expect(screen.getByRole('link', { name: 'SH001' })).toHaveAttribute(
            'href',
            '/shipping/KEY001',
        );
        expect(screen.getByRole('link', { name: 'Label1' })).toHaveAttribute(
            'href',
            '/connections/Service1',
        );
    });

    it('changes page size when select is changed', async () => {
        render(<DataTable {...defaultProps} pagination={true} />);

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '20' } });

        await waitFor(() => {
            expect(select.value).toBe('20');
        });
    });
});
