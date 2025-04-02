const {
    createPreferenceValue,
    deletePreferenceValue,
    getCarrierImageTypes,
    getCarrierStockTypes,
    getConnections,
    getCustomerAddress,
    getCustomerAddressBuilding,
    getCustomerAddressIntegratedShippingProviderAccounts,
    getCustomerAddressResidentialClassification,
    getEnabledCarriers,
    getFeatures,
    getShippingLabel,
    getPlexCustomer,
    getPlexCustomerApis,
    getPreferences,
    getRate,
    getShippers,
    getShipperForm,
    getShippedContainers,
    getShipToAddress,
    getIntegratedShippingAccounts,
    getIntegratedShippingPackages,
    getIntegratedShippingServices,
    syncShipment,
    updateConnection,
    updateIntegratedShipper,
    updateIntegratedShippingCustomerAddress,
    updateIntegratedShippingConfirmation,
    validateAddress,
    voidShipment,
} = require('../index.js');

jest.mock('../../lib/get-session-token-header');
jest.mock('../../lib/request-handler');

const { getSessionTokenHeader } = require('../../lib/get-session-token-header');
const { requestHandler } = require('../../lib/request-handler');

describe('API Module Tests', () => {
    beforeEach(() => {
        getSessionTokenHeader.mockReset();
        requestHandler.mockReset();
    });

    const plexCustomerState = { pcid: '12345', sessionToken: 'token' };
    const body = { some: 'data' };
    const service = 'service';
    const targetModel = 'model';
    const imageType = { value: 'imageValue', key: 'imageKey' };
    const shipperKey = 'shipperKey';
    const validatedAddress = { address: 'validatedAddress' };
    const buildingKey = 'buildingKey';
    const customerNo = 'customerNo';
    const customerAddressNo = 'customerAddressNo';
    const residential = 'residential';
    const shipFrom = 'shipFrom';
    const selectedCarrier = {
        Name: 'carrierName',
        Integrated_Shipping_Provider_Type_Key: 'carrierKey',
    };
    const selectedService = 'selectedService';
    const shipperNo = 'shipper123';
    const selectedAccount = 'selectedAccount';
    const selectedBillTo = 'selectedBillTo';
    const selectedImageType = 'selectedImageType';
    const selectedStockType = 'selectedStockType';
    const integratedShippingServiceKey = 'integratedShippingServiceKey';
    const integratedShippingProviderTypeKey = '1';
    const selectedShipper = 'selectedShipper';
    const selectedBillingType = 'selectedBillingType';
    const user = { sessionToken: 'token', email: 'user@example.com' };
    const trackingNo = 'trackingNo';
    const query = {
        fields: ['Plex_Record_Type', 'Container_Key', 'Serial_No'],
    };

    it('should call requestHandler correctly for createPreferenceValue', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        createPreferenceValue(plexCustomerState, service, body);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'POST',
            '/account/preference/12345/create-preference-value?service=service',
            body,
            headers,
        );
    });

    it('should call requestHandler correctly for deletePreferenceValue', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        deletePreferenceValue(plexCustomerState, service, body);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'DELETE',
            '/account/preference/12345/delete-preference-value?service=service',
            body,
            headers,
        );
    });

    it('should call requestHandler correctly for getCarrierImageTypes', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getCarrierImageTypes(plexCustomerState, service, targetModel);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            '/feature/12345/get-carrier-image-types?service=service&targetModel=model',
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getCarrierStockTypes', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getCarrierStockTypes(plexCustomerState, service, imageType, targetModel);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            '/feature/12345/get-carrier-stock-types?service=service&imageType=imageValue&targetModel=model&targetKey=imageKey',
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getConnections', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getConnections(plexCustomerState, service);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            '/connection/12345/service/get-connections',
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getCustomerAddress', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getCustomerAddress(plexCustomerState, customerNo, customerAddressNo);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            `/transform/12345/plex/get-customer-address?customerNo=${customerNo}&customerAddressNo=${customerAddressNo}`,
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getCustomerAddressBuilding', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getCustomerAddressBuilding(plexCustomerState, buildingKey);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            `/transform/12345/plex/get-customer-address-building?buildingKey=${buildingKey}`,
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getCustomerAddressIntegratedShippingProviderAccounts', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getCustomerAddressIntegratedShippingProviderAccounts(plexCustomerState, query);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            `/transform/12345/plex/get-customer-address-integrated-shipping-provider-accounts?options=${JSON.stringify(
                query,
            )}`,
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getCustomerAddressResidentialClassification', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getCustomerAddressResidentialClassification(
            plexCustomerState,
            shipperKey,
            customerNo,
            customerAddressNo,
        );

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            `/transform/12345/plex/get-customer-address-residential-classification?shipperKey=${shipperKey}&customerNo=${customerNo}&customerAddressNo=${customerAddressNo}`,
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getEnabledCarriers', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getEnabledCarriers(plexCustomerState);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            `/feature/get-enabled-carriers`,
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getFeatures', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getFeatures(plexCustomerState);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            `/feature/get-features?pcid=${plexCustomerState.pcid}`,
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getShippingLabel', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getShippingLabel(plexCustomerState, trackingNo);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            `/feature/get-shipping-label?pcid=${plexCustomerState.pcid}&trackingNo=${trackingNo}`,
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getPlexCustomer', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getPlexCustomer(user, plexCustomerState);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            `/account/plex-customer?user=${user}`,
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getPlexCustomerApis', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getPlexCustomerApis(plexCustomerState);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            `/account/plex-customer-api/${plexCustomerState.pcid}/all`,
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getPreferences', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getPreferences(plexCustomerState);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            `/account/preference/${plexCustomerState.pcid}/all`,
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getRate', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getRate(
            plexCustomerState,
            shipperKey,
            buildingKey,
            selectedService,
            selectedAccount,
            selectedCarrier,
            body,
        );

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'POST',
            `/transform/${plexCustomerState.pcid}/${selectedCarrier}/get-rate?shipperKey=${shipperKey}&buildingKey=${buildingKey}&selectedService=${selectedService}&selectedAccount=${selectedAccount}`,
            body,
            headers,
        );
    });

    it('should call requestHandler correctly for getShippers', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getShippers(plexCustomerState, query);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            `/transform/${
                plexCustomerState.pcid
            }/plex/get-shippers?options=${JSON.stringify(query)}`,
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getShipperForm', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getShipperForm(plexCustomerState, shipperKey);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            `/transform/12345/plex/get-shipper-form?shipperKey=${shipperKey}`,
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getShippedContainers', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getShippedContainers(plexCustomerState, shipperKey, query);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            `/transform/12345/plex/get-shipped-containers?shipperKey=${shipperKey}&options=${JSON.stringify(
                query,
            )}`,
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getShipToAddress', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getShipToAddress(plexCustomerState, shipperKey);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            `/transform/12345/plex/get-ship-to-address?shipperKey=${shipperKey}`,
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getIntegratedShippingAccounts', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getIntegratedShippingAccounts(plexCustomerState, query);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            `/transform/12345/plex/get-integrated-shipping-accounts?options=${JSON.stringify(
                query,
            )}`,
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getIntegratedShippingPackages', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        // Call the function
        getIntegratedShippingPackages(
            plexCustomerState,
            shipperKey,
            integratedShippingProviderTypeKey,
            query,
        );

        // Check if getSessionTokenHeader was called with the correct session token
        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');

        // Check if requestHandler was called with the correct arguments
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            `/transform/12345/plex/get-integrated-shipping-packages?shipperKey=shipperKey&integratedShippingProviderTypeKey=1&options=${JSON.stringify(
                query,
            )}`,
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for getIntegratedShippingServices', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        getIntegratedShippingServices(plexCustomerState, query);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'GET',
            `/transform/12345/plex/get-integrated-shipping-services?options=${JSON.stringify(
                query,
            )}`,
            null,
            headers,
        );
    });

    it('should call requestHandler correctly for syncShipment', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        syncShipment(
            plexCustomerState,
            shipFrom,
            selectedService,
            shipperNo,
            selectedAccount,
            selectedBillTo,
            selectedImageType,
            selectedStockType,
            shipperKey,
            integratedShippingServiceKey,
            selectedCarrier,
            selectedShipper,
            selectedBillingType,
            body,
        );

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'POST',
            `/transform/12345/carrierName/sync-shipment?shipperKey=${shipperKey}&buildingKey=${shipFrom}&selectedService=${selectedService}&shipperNo=${shipperNo}&selectedAccount=${selectedAccount}&selectedBillTo=${selectedBillTo}&selectedBillingType=${selectedBillingType}&selectedImageType=${selectedImageType}&selectedStockType=${selectedStockType}&integratedShippingServiceKey=${integratedShippingServiceKey}&selectedCarrierProviderTypeKey=${selectedCarrier.Integrated_Shipping_Provider_Type_Key}&selectedShipperProviderTypeKey=${selectedShipper.Integrated_Shipping_Provider_Type_Key}`,
            body,
            headers,
        );
    });

    it('should call requestHandler correctly for updateConnection', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        updateConnection(plexCustomerState, service, body);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'POST',
            `/connection/12345/${service}/update-connection`,
            body,
            headers,
        );
    });

    it('should call requestHandler correctly for updateIntegratedShipper', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        updateIntegratedShipper(plexCustomerState, body);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'POST',
            `/transform/12345/plex/update-integrated-shipper`,
            body,
            headers,
        );
    });

    it('should call requestHandler correctly for updateIntegratedShippingConfirmation', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        updateIntegratedShippingConfirmation(plexCustomerState, body);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'POST',
            `/transform/12345/plex/update-integrated-shipping-confirmation`,
            body,
            headers,
        );
    });

    it('should call requestHandler correctly for updateIntegratedShippingCustomerAddress', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        updateIntegratedShippingCustomerAddress(
            plexCustomerState,
            shipperKey,
            validatedAddress,
            customerNo,
            customerAddressNo,
            residential,
            selectedCarrier,
        );

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'POST',
            `/transform/12345/plex/update-integrated-shipping-customer-address?shipperKey=${shipperKey}&name=${selectedCarrier}&customerNo=${customerNo}&customerAddressNo=${customerAddressNo}&residential=${residential}`,
            validatedAddress,
            headers,
        );
    });

    it('should call requestHandler correctly for validateAddress', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        validateAddress(plexCustomerState, shipperKey, selectedCarrier, body);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'POST',
            `/transform/12345/${selectedCarrier}/validate-address?shipperKey=${shipperKey}`,
            body,
            headers,
        );
    });

    it('should call requestHandler correctly for voidShipment', () => {
        const headers = { Authorization: 'Bearer token' };
        getSessionTokenHeader.mockReturnValue(headers);

        voidShipment(plexCustomerState, service, shipperKey, body);

        expect(getSessionTokenHeader).toHaveBeenCalledWith('token');
        expect(requestHandler).toHaveBeenCalledWith(
            'DELETE',
            `/transform/12345/${service}/void-shipment?shipperKey=${shipperKey}`,
            body,
            headers,
        );
    });
});
