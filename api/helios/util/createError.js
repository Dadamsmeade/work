module.exports = {
    /**Since `/helios` contains `/v1` public API access, create explicitly detailed error messages for API consumers */
    createError: (message, statusCode, details = undefined) => {
        const error = new Error(message);
        error.status = statusCode;
        error.details = details;
        throw error;
    },
};
