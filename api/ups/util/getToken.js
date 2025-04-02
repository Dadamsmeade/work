const axios = require('axios');
const { getSecretByType } = require('../../../../connection/services/secretService');

module.exports = {
    getToken: async req => {
        req.body.grant_type = 'client_credentials';

        const username = await getSecretByType(req, { Username: true });
        const password = await getSecretByType(req, { Password: true });
        const response = await axios({
            method: 'post',
            url: 'https://onlinetools.ups.com/security/v1/oauth/token',
            auth: {
                username: username.value,
                password: password.value,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: req.body,
        });
        return response.data;
    },
};
