import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CarrierLogo from '../carrierLogo.js';

describe('CarrierLogo', () => {
    test('renders null when carrier is not provided', () => {
        render(<CarrierLogo />);
        expect(screen.queryByText('UPS')).not.toBeInTheDocument();
        expect(screen.queryByText('FedEx')).not.toBeInTheDocument();
    });

    test('renders UPS logo', () => {
        const carrier = {
            Label: 'UPS',
            Settings: {
                colors: {
                    secondary: '#000000',
                },
            },
        };
        render(<CarrierLogo carrier={carrier} />);
        const upsLogo = screen.getByText('UPS');
        expect(upsLogo).toBeInTheDocument();
    });

    test('renders FedEx logo', () => {
        const carrier = {
            Label: 'FedEx',
            Settings: {
                colors: {
                    primary: '#4d148c',
                    secondary: '#ff6600',
                },
            },
        };
        render(<CarrierLogo carrier={carrier} />);
        const fedText = screen.getByText('Fed');
        const exText = screen.getByText('Ex');
        expect(fedText).toBeInTheDocument();
        expect(exText).toBeInTheDocument();
    });

    test('renders null when carrier is not UPS or FedEx', () => {
        const carrier = {
            Label: 'An Arbitrary Carrier',
        };
        render(<CarrierLogo carrier={carrier} />);
        expect(screen.queryByText('UPS')).not.toBeInTheDocument();
        expect(screen.queryByText('FedEx')).not.toBeInTheDocument();
    });
});
