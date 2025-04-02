const { v4: uuidv4 } = require('uuid');
const { serverResponse } = require('../../../../lib/server-response');
const { normalizeError } = require('../../../../lib/normalize-error');

// In-memory SSE clients
let sseClients = [];

// Helper to check and remove stale clients
const checkForStaleClients = channel => {
    const now = new Date();

    const staleConnections = sseClients.filter(c => {
        if (c.channel !== channel) return false;

        const minutesElapsed = (now - new Date(c.connectedAt)) / (1000 * 60 * 1440 * 3);
        return minutesElapsed > 1; // Stale if older than 3 days
    });

    if (staleConnections.length > 0) {
        console.log(
            `Found ${staleConnections.length} stale connection(s) for channel=${channel} (older than 3 days)`,
        );

        // Close each stale connection
        staleConnections.forEach(staleClient => {
            console.log(`Closing stale clientID=${staleClient.clientId}`);
            staleClient.res.end(); // Close the SSE connection
        });

        // Filter out stale connections from sseClients
        sseClients = sseClients.filter(client => !staleConnections.includes(client));
    }
};

const manageConnections = (clientId, channel, res, req) => {
    // Set SSE response headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // first create a new client
    createClient(clientId, channel, res, req);
    // then clean up stale clients if they exist
    checkForStaleClients(channel);
    return;
};

const createClient = (clientId, channel, res, req) => {
    const client = {
        clientId,
        channel,
        res,
        connectedAt: new Date(),
    };
    sseClients.push(client);
    console.log(`New client added: clientId=${clientId}, channel=${channel}`);

    // Send initial message
    res.write(
        `data: ${JSON.stringify({
            connected: true,
            clientId,
            channel,
        })}\n\n`,
    );

    // Keep-alive heartbeat
    const heartbeat = setInterval(() => {
        try {
            res.write(
                `data: ${JSON.stringify({
                    heartbeat: 'ping',
                    timestamp: new Date(),
                })}\n\n`,
            );
        } catch (err) {
            console.log(`Error sending heartbeat to clientId=${clientId}`);
            clearInterval(heartbeat);
            res.end();
        }
    }, 10000);

    // Handle client disconnect
    req.on('close', () => {
        console.log(`Client disconnected: clientId=${clientId}`);
        clearInterval(heartbeat);

        const index = sseClients.findIndex(
            c => c.clientId === clientId && c.channel === channel,
        );
        if (index !== -1) {
            sseClients.splice(index, 1);
        }
    });
};

module.exports = {
    sseConnect: async (req, res, next) => {
        try {
            const { channel } = req.query;

            if (!channel) {
                return res
                    .status(400)
                    .send({ status: 'error', message: 'channel is required' });
            }

            manageConnections(uuidv4(), channel, res, req);
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    sseBroadcast: async (channel, data) => {
        try {
            let successCount = 0;

            sseClients.forEach(client => {
                if (client.channel === channel.toString()) {
                    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
                    successCount++;
                }
            });

            return {
                clients: successCount,
            };
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    sseDisconnect: (req, res, next) => {
        try {
            // should only need this in case of manual cleanup
            const { clientId } = req.query;

            const index = sseClients.findIndex(c => c.clientId === clientId);
            if (index === -1) {
                return res
                    .status(404)
                    .send({ connection: 'No active connection found for this clientId' });
            }

            const client = sseClients[index];
            client.res.end();

            return serverResponse(res, {
                connection: `Disconnected clientId=${clientId}`,
            });
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    sseListClients: (req, res, next) => {
        try {
            const clientList = sseClients.map(c => ({
                clientId: c.clientId,
                channel: c.channel,
                connectedAt: c.connectedAt,
            }));
            return serverResponse(res, clientList);
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },
};
