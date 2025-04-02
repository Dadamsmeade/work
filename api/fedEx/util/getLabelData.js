module.exports = {
    getLabelData: createdShipment => {
        if (createdShipment?.data.output.transactionShipments[0].shipmentDocuments) {
            // Multipiece labels
            return {
                url: createdShipment.data.output.transactionShipments[0]
                    .shipmentDocuments[0].url,
                batch: true,
            };
        }
        if (
            !createdShipment?.data.output.transactionShipments[0].shipmentDocuments &&
            createdShipment?.data.output.transactionShipments[0].pieceResponses.length ===
                1
        ) {
            return {
                url: createdShipment?.data.output.transactionShipments[0]
                    .pieceResponses[0].packageDocuments[0].url,
                batch: false,
            };
        }
    },
};
