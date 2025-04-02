module.exports = {
    combinePackages: shipment => {
        const combinedPackages =
            shipment?.pieceResponses?.map(piece => {
                const completedDetail =
                    shipment?.completedShipmentDetail?.completedPackageDetails?.find(
                        detail => detail?.sequenceNumber === piece?.packageSequenceNumber,
                    );
                return { piece, completedDetail };
            }) || null;
        return combinedPackages;
    },
};
