import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrintLabel from '../packageLabel';
import { ShippingContext } from '../../../context/shippingContext';

describe('PrintLabel', () => {
    const mockShippingState = {
        shipmentConfirmation: {
            output: {
                transactionShipments: [
                    {
                        pieceResponses: [
                            {},
                            {},
                        ],
                    },
                ],
            },
        },
    };

    const mockPackageDetail = {
        packageDocuments: [
            {
                url: 'https://label.com/label.pdf',
            },
        ],
    };

    const renderWithContext = (
        shippingState = mockShippingState,
        packageDetail = mockPackageDetail,
    ) => {
        return render(
            <ShippingContext.Provider value={{ shippingState }}>
                <PrintLabel packageDetail={packageDetail} />
            </ShippingContext.Provider>,
        );
    };

    it('renders the Print Label button when there are multiple pieces', () => {
        renderWithContext();
        expect(screen.getByText('Print Label')).toBeInTheDocument();
    });

    it('does not render the Print Label button when there is only one piece', () => {
        const singlePieceState = {
            shipmentConfirmation: {
                output: {
                    transactionShipments: [
                        {
                            pieceResponses: [{}],
                        },
                    ],
                },
            },
        };
        renderWithContext(singlePieceState);
        expect(screen.queryByText('Print Label')).not.toBeInTheDocument();
    });

    it('renders the Print Label button with correct link', () => {
        renderWithContext();
        const linkElement = screen.getByRole('link');
        expect(linkElement).toHaveAttribute('href', 'https://label.com/label.pdf');
    });
});
