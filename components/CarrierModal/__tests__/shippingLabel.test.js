import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShippingContext } from '../../../context/shippingContext.js';
import ShippingLabel from '../shippingLabel.js';

describe('Shipping Label tests', () => {
    const renderWithContext = shippingState => {
        return render(
            <ShippingContext.Provider value={{ shippingState }}>
                <ShippingLabel />
            </ShippingContext.Provider>,
        );
    };

    test('renders nothing when shippingLabelData is null', () => {
        const shippingState = {
            shippingLabelData: null,
        };
        renderWithContext(shippingState);
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    test('renders FedEx batch label button when shippingLabelData available', () => {
        const shippingState = {
            shippingLabelData: {
                URL: 'https://fedex.com/get-batch-labels',
                Batch: true,
            },
        };
        renderWithContext(shippingState);
        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            'https://fedex.com/get-batch-labels',
        );
        expect(screen.getByText('Batch Labels')).toBeInTheDocument();
    });

    test('renders FedEx single label button when shippingLabelData available', () => {
        const shippingState = {
            shippingLabelData: {
                URL: 'https://fedex.com/get-single-label',
                Batch: false,
            },
        };
        renderWithContext(shippingState);
        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            'https://fedex.com/get-single-label',
        );
        expect(screen.getByText('Print Label')).toBeInTheDocument();
    });

    test('renders UPS batch label button when shippingLabelData available', () => {
        const shippingState = {
            shippingLabelData: {
                URL: 'https://ups.com/get-batch-labels',
                Batch: true,
            },
        };
        renderWithContext(shippingState);
        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            'https://ups.com/get-batch-labels',
        );
        expect(screen.getByText('Batch Labels')).toBeInTheDocument();
    });

    test('renders UPS single label button when shippingLabelData available', () => {
        const shippingState = {
            shippingLabelData: {
                URL: 'https://ups.com/get-single-label',
                Batch: false,
            },
        };
        renderWithContext(shippingState);
        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            'https://ups.com/get-single-label',
        );
        expect(screen.getByText('Print Label')).toBeInTheDocument();
    });
});
