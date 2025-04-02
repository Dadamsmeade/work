const { serverResponse } = require('../../../../lib/server-response');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

const readableStreamToJSON = async readableStream => {
    try {
        const chunks = [];
        for await (const chunk of readableStream) {
            chunks.push(chunk);
        }

        // Combine all chunks into a single string
        const rawData = Buffer.concat(chunks).toString();

        // Split the raw data into lines and parse each line as JSON
        const parsedData = rawData
            .split('\n') // Split by newlines
            .filter(line => line.trim() !== '') // Remove empty lines
            .map(line => JSON.parse(line)); // Parse each line as JSON

        return parsedData;
    } catch (error) {
        console.error('Error while parsing NDJSON:', error.message);
        throw error;
    }
};

/**
 * Validate and adjust date range
 * @param {string} startDateQuery - Start date from query parameter
 * @param {string} endDateQuery - End date from query parameter
 * @param {number} maxRangeInDays - Maximum allowed range in days
 * @returns {Object} - Validated and adjusted startDate and endDate
 */
const parseAndValidateDateRange = (startDateQuery, endDateQuery, maxRangeInDays) => {
    // Validate date formats
    if (!startDateQuery && endDateQuery) {
        throw new Error('Please provide valid startDate.');
    }

    const startDate = startDateQuery
        ? new Date(startDateQuery)
        : new Date(new Date().setHours(0, 0, 0, 0)); // Default to midnight today

    let endDate = endDateQuery ? new Date(endDateQuery) : new Date(); // Default to now

    // Validate date formats
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error(
            'Invalid date format. Please provide valid startDate and endDate.',
        );
    }

    // Adjust endDate to always include the full day
    endDate = new Date(endDate.setHours(23, 59, 59, 999));

    // Ensure startDate is not after endDate
    if (startDate > endDate) {
        throw new Error('startDate cannot be after endDate.');
    }

    // Ensure the date range does not exceed the maximum allowed range
    const dateDiffInDays = (endDate - startDate) / (1000 * 60 * 60 * 24); // Difference in days
    if (dateDiffInDays > maxRangeInDays) {
        throw new Error(`Query cannot exceed ${maxRangeInDays} days.`);
    }

    return { startDate, endDate };
};

module.exports = {
    storage: {
        listBlobs: async (req, res, next) => {
            try {
                // Create the BlobServiceClient object with connection string
                const blobServiceClient = BlobServiceClient.fromConnectionString(
                    process.env.AZURE_STORAGE_CONNECTION_STRING,
                );

                // Define the container name
                const containerClient = blobServiceClient.getContainerClient(
                    req.query.containerName,
                );

                // Array to store blob details
                const blobs = [];

                // List the blobs in the container
                for await (const blob of containerClient.listBlobsFlat()) {
                    const tempBlockBlobClient = containerClient.getBlockBlobClient(
                        blob.name,
                    );

                    // Add blob details to the array
                    blobs.push({
                        name: blob.name,
                        url: tempBlockBlobClient.url,
                    });
                }

                // Return the blob list as a JSON response
                return serverResponse(res, {
                    data: blobs,
                });
            } catch (err) {
                console.error(`Error: ${err.message}`);
                next(err);
            }
        },

        getLatestBlob: async (req, res, next) => {
            try {
                // Create the BlobServiceClient object with connection string
                const blobServiceClient = BlobServiceClient.fromConnectionString(
                    process.env.AZURE_STORAGE_CONNECTION_STRING,
                );

                const containerClient = blobServiceClient.getContainerClient(
                    req.query.containerName,
                );

                let mostRecentBlob = null;

                // List blobs in the container and find the most recent one
                for await (const blob of containerClient.listBlobsFlat()) {
                    // If mostRecentBlob is not set OR the current blob's lastModified is more recent
                    if (
                        !mostRecentBlob ||
                        new Date(blob.properties.lastModified) >
                            new Date(mostRecentBlob.lastModified)
                    ) {
                        // Update mostRecentBlob to the current blob
                        mostRecentBlob = {
                            name: blob.name,
                            lastModified: blob.properties.lastModified,
                        };
                    }
                }

                // Get a block blob client for the most recent blob
                const blockBlobClient = containerClient.getBlockBlobClient(
                    mostRecentBlob.name,
                );
                const downloadBlockBlobResponse = await blockBlobClient.download(0);

                const data = await readableStreamToJSON(
                    downloadBlockBlobResponse.readableStreamBody,
                );

                return serverResponse(res, {
                    message: `Latest Blob created ${mostRecentBlob.lastModified} and retrieved from Container ${containerClient._containerName}`,
                    data: data,
                });
            } catch (error) {
                console.error(`Error: ${error.message}`);
                next(error);
            }
        },

        /**
         * Fetch all blobs within a given date range.
         * Default to today's date if no range is provided.
         */
        getBlobsFromDate: async (req, res, next) => {
            try {
                // Create the BlobServiceClient object with connection string
                const blobServiceClient = BlobServiceClient.fromConnectionString(
                    process.env.AZURE_STORAGE_CONNECTION_STRING,
                );

                const containerClient = blobServiceClient.getContainerClient(
                    req.query.storageContainerName,
                );

                // Validate and adjust date range
                let startDate, endDate;
                try {
                    ({ startDate, endDate } = parseAndValidateDateRange(
                        req.query.startDate,
                        req.query.endDate,
                        7, // Maximum range of 7 days
                    ));
                } catch (error) {
                    return res.status(400).json({ message: error.message });
                }

                const matchingBlobs = [];

                // List blobs in the container and filter by `lastModified`
                for await (const blob of containerClient.listBlobsFlat()) {
                    const blobLastModified = new Date(blob.properties.lastModified);

                    // Check if blob is within the specified date range
                    if (blobLastModified >= startDate && blobLastModified <= endDate) {
                        matchingBlobs.push({
                            name: blob.name,
                            lastModified: blob.properties.lastModified,
                        });
                    }
                }

                if (matchingBlobs.length === 0) {
                    return serverResponse(res, {
                        message: 'No blobs found for the specified time period.',
                    });
                }

                // Sort blobs in ascending order by lastModified date
                matchingBlobs.sort(
                    (a, b) => new Date(a.lastModified) - new Date(b.lastModified),
                );

                // Download and parse all matching blobs
                const blobContents = [];
                for (const blob of matchingBlobs) {
                    const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
                    const downloadBlockBlobResponse = await blockBlobClient.download(0);

                    const data = await readableStreamToJSON(
                        downloadBlockBlobResponse.readableStreamBody,
                    );

                    blobContents.push({
                        name: blob.name,
                        lastModified: blob.lastModified,
                        ...(req.query.content === 'true' && { content: data }), // Check for the string 'true'
                    });
                }

                // Return the downloaded blob data
                return serverResponse(res, {
                    message: `Blobs retrieved from ${startDate.toISOString()} to ${endDate.toISOString()}.`,
                    data: blobContents,
                });
            } catch (error) {
                console.error(`Error: ${error.message}`);
                next(error);
            }
        },
    },
};
