const axios = require('axios');
const { getSecretByType } = require('../../../../connection/services/secretService');

module.exports = {
    getToken: async req => {
        const consumerKey = await getSecretByType(req, { Consumer_Key: true });
        const consumerSecret = await getSecretByType(req, { Consumer_Secret: true });
        const tokenEndpoint = 'https://apis.fedex.com/oauth/token';
        const credentials = `grant_type=client_credentials&client_id=${encodeURIComponent(
            consumerKey.value,
        )}&client_secret=${encodeURIComponent(consumerSecret.value)}`;

        const response = await axios.post(tokenEndpoint, credentials, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data.access_token;
    },
};
