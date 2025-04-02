module.exports = {
    mockApiCall: (secret, mockInputData, interval, type, name, mockResponse) => {
        return new Promise((resolve, reject) => {
            resolve(mockResponse);
        });
    },
};
