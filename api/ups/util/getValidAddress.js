const axios = require('axios');

module.exports = {
    getValidAddress: async (bearerToken, XAVRequest) => {
        const requestoption = '1';
        const version = 'v2';
        const response = await axios({
            method: 'POST',
            url: `https://onlinetools.ups.com/api/addressvalidation/${version}/${requestoption}`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${bearerToken.access_token}`,
            },
            data: XAVRequest,
        });
        return response.data;
    },
};
