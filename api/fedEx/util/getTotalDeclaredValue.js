module.exports = {
    getTotalDeclaredValue: packages => {
        return packages?.reduce((total, pkg) => {
            const value = pkg.Declared_Value || 0;
            return total + value;
        }, 0);
    },
};
