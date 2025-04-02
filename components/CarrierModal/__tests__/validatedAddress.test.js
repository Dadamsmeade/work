import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ValidatedAddress from '../validatedAddress.js';

describe('ValidatedAddress', () => {
    test('renders FedEx address correctly', () => {
        const validatedAddress = {
            output: {
                resolvedAddresses: [
                    {
                        streetLinesToken: ['2801 Newtown Blvd'],
                        city: 'Sarasota',
                        stateOrProvinceCode: 'FL',
                        postalCode: '34234',
                        countryCode: 'USA',
                    },
                ],
            },
        };

        render(<ValidatedAddress validatedAddress={validatedAddress} />);

        expect(screen.getByText('2801 Newtown Blvd')).toBeInTheDocument();
        expect(screen.getByText('Sarasota, FL 34234')).toBeInTheDocument();
        expect(screen.getByText('USA')).toBeInTheDocument();
    });

    test('renders UPS address correctly', () => {
        const validatedAddress = {
            XAVResponse: {
                ValidAddressIndicator: '',
                Candidate: [
                    {
                        AddressKeyFormat: {
                            AddressLine: '2801 NEWTOWN BLVD',
                            Region: 'SARASOTA FL 34234-6239',
                            CountryCode: 'USA',
                        },
                    },
                ],
            },
        };

        render(<ValidatedAddress validatedAddress={validatedAddress} />);

        expect(screen.getByText('2801 NEWTOWN BLVD')).toBeInTheDocument();
        expect(screen.getByText('SARASOTA FL 34234-6239')).toBeInTheDocument();
        expect(screen.getByText('USA')).toBeInTheDocument();
    });

    test('renders Address not available when address is not valid', () => {
        const validatedAddress = {};

        render(<ValidatedAddress validatedAddress={validatedAddress} />);

        expect(screen.getByText('Address not available')).toBeInTheDocument();
    });
});
