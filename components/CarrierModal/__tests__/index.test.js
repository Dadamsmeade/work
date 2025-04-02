import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CarrierModal from '../index';
import { ShippingContext } from '../../../context/shippingContext';

// Mock child components
jest.mock('../carrierSelect', () => () => (
    <div data-testid="mock-carrier-select">Carrier Select</div>
));
jest.mock('../billingType', () => () => (
    <div data-testid="mock-billing-type">Billing Type</div>
));
jest.mock('../billing', () => () => <div data-testid="mock-billing">Billing</div>);
jest.mock('../services', () => () => <div data-testid="mock-services">Services</div>);
jest.mock('../packages', () => () => <div data-testid="mock-packages">Packages</div>);
jest.mock('../address', () => () => <div data-testid="mock-address">Address</div>);
jest.mock('../rate', () => () => <div data-testid="mock-rate">Rate</div>);
jest.mock('../shipment', () => () => <div data-testid="mock-shipment">Shipment</div>);
jest.mock('../carrierLogo', () => () => (
    <div data-testid="mock-carrier-logo">Carrier Logo</div>
));

describe('CarrierModal component', () => {
    const mockDispatchShipping = jest.fn();
    const mockOnClose = jest.fn();

    const defaultShippingState = {
        modalPage: 0,
        selectedCarrier: null,
        selectedBillingType: null,
        isNextDisabled: false,
    };

    const renderWithContext = (shippingState = defaultShippingState) => {
        return render(
            <ShippingContext.Provider
                value={{ shippingState, dispatchShipping: mockDispatchShipping }}
            >
                <CarrierModal isOpen={true} onClose={mockOnClose} />
            </ShippingContext.Provider>,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the modal with initial content', () => {
        renderWithContext();
        expect(screen.getByText('Carrier')).toBeInTheDocument();
        expect(screen.getByTestId('mock-carrier-select')).toBeInTheDocument();
        expect(screen.getByText('Back')).toBeInTheDocument();
        expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('disables Back button on first page', () => {
        renderWithContext();
        expect(screen.getByText('Back')).toBeDisabled();
    });

    it('renders correct component based on modalPage', () => {
        renderWithContext({ ...defaultShippingState, modalPage: 2 });
        expect(screen.getByTestId('mock-billing')).toBeInTheDocument();
    });

    it('disables Next button when isNextDisabled is true', () => {
        renderWithContext({ ...defaultShippingState, isNextDisabled: true });
        expect(screen.getByText('Next')).toBeDisabled();
    });

    it('renders carrier logo when a carrier is selected', () => {
        renderWithContext({
            ...defaultShippingState,
            selectedCarrier: { name: 'FedEx' },
        });
        expect(screen.getByTestId('mock-carrier-logo')).toBeInTheDocument();
    });
});
