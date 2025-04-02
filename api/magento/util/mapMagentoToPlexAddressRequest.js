module.exports = {
    /**
     * Maps a Magento order address to Plex address format
     *
     * @param {Object} magentoOrder - Magento order object containing address information
     * @param {Object} magentoOrder.billing_address - Billing address details from Magento
     * @param {Object} magentoOrder.extension_attributes - Contains shipping address information
     * @param {Object} customerNo - Plex customer number details
     * @param {boolean} isBillTo - Flag indicating if this is a billing address (true) or shipping address (false)
     * @returns {Object} Plex-formatted address object containing all required fields:
     *   - Active: Activity status (1 for active)
     *   - Address: Street address
     *   - Bill_To: Billing address indicator
     *   - Ship_To: Shipping address indicator
     *   - Customer_Address_Code: Unique address identifier
     *   - Customer_Address_Name: Display name for address
     *   - Contact information (Name, Email, Phone)
     *   - Location details (City, State, Country, Zip)
     */
    mapMagentoToPlexAddressRequest: (magentoOrder, customerCode, buildingCode, isBillTo) => {
        const address = isBillTo
            ? magentoOrder.billing_address
            : magentoOrder.extension_attributes.shipping_assignments[0].shipping.address;

        return {
            Active: true,
            Address: address.street[0],
            Bill_To: isBillTo ? 1 : 0,
            City: address.city,
            // Contact_Note: `${address.firstname} ${address.lastname}`,
            Country: address.country_id,
            County: '',
            Customer_Address_Code: `${address.firstname} ${address.lastname} ${
                address.entity_id
            } - ${isBillTo ? 'Bill To' : 'Ship To'}`,
            Customer_Address_Name: `${address.firstname} ${address.lastname} - ${
                isBillTo ? 'Bill To' : 'Ship To'
            }`,
            Customer_Code: customerCode,
            Default_Ship_From: buildingCode,
            Email: address.email,
            // Fax: '',
            // Note: '',
            Phone: address.telephone || '',
            Ship_To: isBillTo ? 0 : 1,
            State: address.region,
            Zip: address.postcode,
        };
    },
};
