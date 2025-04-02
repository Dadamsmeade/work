const { blobContainerClient } = require('../../../../../lib/blob-container-client.js');
const {
    generateBlobSASQueryParameters,
    BlobSASPermissions,
    StorageSharedKeyCredential,
} = require('@azure/storage-blob');
const {
    getStorageAccountSecret,
} = require('../../../../connection/services/secretService.js');

module.exports = {
    /** get asset URLs from blob storage */
    getControlPlanAssets: async (req, plexCustomer, fullControlPlan) => {
        const connectionString = await getStorageAccountSecret(
            req,
            { Connection_String: true },
            plexCustomer,
        );

        if (!connectionString) throw new Error('Storage connection not found.');

        const containerClient = blobContainerClient(
            connectionString.secret,
            connectionString.storageAccount.Storage_Containers[0].Container_Name,
        );

        const accountKey = await getStorageAccountSecret(
            req,
            { Account_Key: true },
            plexCustomer,
        );
        if (!accountKey) throw new Error('Storage account key not found.');

        const sharedKeyCredential = new StorageSharedKeyCredential(
            accountKey.storageAccount.Account_Name,
            accountKey.secret.value,
        );

        // separate caches for each document array.
        const lineDocCache = new Map();
        const primaryDocCache = new Map();

        const getBlobProperties = async blockBlobClient => {
            try {
                return await blockBlobClient.getProperties();
            } catch (error) {
                // console.error('Error fetching blob..\n', error);
            }
        };

        // get SAS-enabled URL and blob properties with caching.
        const getDocumentProps = async (documentName, cache) => {
            if (cache.has(documentName)) {
                return cache.get(documentName);
            }
            const blockBlobClient = containerClient.getBlockBlobClient(documentName);
            const blobProperties = await getBlobProperties(blockBlobClient);
            if (!blobProperties) return undefined; // exit if documentName is mismatched or blob not found

            const expiresOn = new Date(Date.now() + 86400 * 1000); // 24 hours token
            const sasOptions = {
                containerName: containerClient.containerName,
                blobName: documentName,
                expiresOn,
                permissions: BlobSASPermissions.parse('r'), // read-only permission
            };
            const sasToken = generateBlobSASQueryParameters(
                sasOptions,
                sharedKeyCredential,
            ).toString();
            const result = {
                name: documentName,
                url: `${blockBlobClient.url}?${sasToken}`,
                contentType: blobProperties.contentType,
            };
            cache.set(documentName, result);
            return result;
        };

        const parseDocNames = docNames =>
            docNames.trim() !== '' ? docNames.split(',').map(doc => doc.trim()) : [];

        // loop through each control plan line.
        for (const line of fullControlPlan.data) {
            // Convert the Control_Plan_Line_Document_Names to an array.
            const lineDocNames = parseDocNames(line.Control_Plan_Line_Document_Names);
            const parentDocNames = parseDocNames(line.Control_Plan_Document_Names);

            // process both document arrays concurrently.
            let [lineDocs, parentDocs] = await Promise.all([
                lineDocNames.length
                    ? Promise.all(
                          lineDocNames.map(doc => getDocumentProps(doc, lineDocCache)),
                      )
                    : Promise.resolve([]),
                parentDocNames.length
                    ? Promise.all(
                          parentDocNames.map(doc =>
                              getDocumentProps(doc, primaryDocCache),
                          ),
                      )
                    : Promise.resolve([]),
            ]);

            // remove the unfound docs
            lineDocs = lineDocs.filter(doc => doc !== undefined);
            parentDocs = parentDocs.filter(doc => doc !== undefined);

            // save each array to the line for reference.
            line.Control_Plan_Line_Documents = lineDocs;
            line.Control_Plan_Documents = parentDocs;

            // merge parent docs first, then line docs.
            const mergedDocs = [...parentDocs, ...lineDocs];

            // deduplicate while preserving the order.
            const seen = new Set();
            const dedupedDocs = mergedDocs.filter(doc => {
                if (seen.has(doc.name)) return false;
                seen.add(doc.name);
                return true;
            });

            line.Control_Plan_Line_Documents = dedupedDocs;
        }

        return fullControlPlan;
    },
};
