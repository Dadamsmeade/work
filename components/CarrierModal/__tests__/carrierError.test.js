import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CarrierError from '../carrierError.js';

describe('CarrierError', () => {
    test('renders nothing when error and generic are not provided', () => {
        render(<CarrierError />);
        expect(screen.queryByText('Processing Error')).not.toBeInTheDocument();
    });

    test('renders generic error message', () => {
        const genericError = 'Something went wrong.';
        render(<CarrierError generic={genericError} />);
        expect(screen.getByText('Processing Error')).toBeInTheDocument();
        expect(screen.getByText(genericError)).toBeInTheDocument();
    });

    test('renders error message', () => {
        const error = {
            label: 'Error',
            message: 'An error occurred.',
        };
        render(<CarrierError error={error} />);
        expect(screen.getByText('Processing Error')).toBeInTheDocument();
        expect(screen.getByText(error.label)).toBeInTheDocument();
        expect(screen.getByText(error.message)).toBeInTheDocument();
    });

    test('renders error details', () => {
        const error = {
            label: 'Error',
            message: 'An error occurred.',
            details: [
                {
                    code: 'ERROR_CODE',
                    message: 'Error message',
                    parameterList: [
                        { key: 'Parameter 1', value: 'Value 1' },
                        { key: 'Parameter 2', value: 'Value 2' },
                    ],
                },
            ],
        };
        render(<CarrierError error={error} />);
        expect(screen.getByText('Processing Error')).toBeInTheDocument();
        expect(screen.getByText(error.label)).toBeInTheDocument();
        expect(screen.getByText(error.message)).toBeInTheDocument();
        expect(screen.getByText('Code:')).toBeInTheDocument();
        expect(screen.getByText('ERROR_CODE')).toBeInTheDocument();
        expect(screen.getByText('Message:')).toBeInTheDocument();
        expect(screen.getByText('Error message')).toBeInTheDocument();
        expect(screen.getByText('Details:')).toBeInTheDocument();
        expect(screen.getByText('Parameter 1: Value 1')).toBeInTheDocument();
        expect(screen.getByText('Parameter 2: Value 2')).toBeInTheDocument();
    });
});
