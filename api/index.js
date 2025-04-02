import { getSessionTokenHeader } from '../lib/get-session-token-header';
import { requestHandler } from '../lib/request-handler';
import { getBaseUrl } from '../lib/get-base-url.js';

module.exports = {
    createPreferenceValue: (plexCustomerState, service, body) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/account/preference/${pcid}/create-preference-value?service=${service}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('POST', uri, body, headers);
    },

    deletePreferenceValue: (plexCustomerState, service, body) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/account/preference/${pcid}/delete-preference-value?service=${service}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('DELETE', uri, body, headers);
    },

    getPickerWorkcenters: plexCustomerState => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/plex/get-picker-workcenters`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getCarrierImageTypes: (plexCustomerState, service, targetModel) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/feature/${pcid}/get-carrier-image-types?service=${service}&targetModel=${targetModel}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getCarrierStockTypes: (plexCustomerState, service, imageType, targetModel) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/feature/${pcid}/get-carrier-stock-types?service=${service}&imageType=${imageType.value}&targetModel=${targetModel}&targetKey=${imageType.key}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getConnections: (plexCustomerState, service) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/connection/${pcid}/${service}/get-connections`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getControlPlan: (plexCustomerState, workcenter, active) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/helios/get-control-plan?workcenter=${workcenter}&active=${active}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getCustomerAddress: (plexCustomerState, customerNo, customerAddressNo) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/plex/get-customer-address?customerNo=${customerNo}&customerAddressNo=${customerAddressNo}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getCustomerAddressBuilding: (plexCustomerState, buildingKey) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/plex/get-customer-address-building?buildingKey=${buildingKey}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getCustomerAddressIntegratedShippingProviderAccounts: (plexCustomerState, query) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/plex/get-customer-address-integrated-shipping-provider-accounts?options=${JSON.stringify(
            query,
        )}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getCustomerAddressResidentialClassification: (
        plexCustomerState,
        shipperKey,
        customerNo,
        customerAddressNo,
    ) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/plex/get-customer-address-residential-classification?shipperKey=${shipperKey}&customerNo=${customerNo}&customerAddressNo=${customerAddressNo}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getEnabledCarriers: plexCustomerState => {
        const { sessionToken } = plexCustomerState;
        const uri = `/feature/get-enabled-carriers`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getFeatures: plexCustomerState => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/feature/get-features?pcid=${pcid}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getShippingLabel: (plexCustomerState, trackingNo) => {
        // Same issue with createPrinterLabel here
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/feature/get-shipping-label?pcid=${pcid}&trackingNo=${trackingNo}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getPlexCustomer: (user, plexCustomerState) => {
        const { sessionToken } = plexCustomerState;
        const uri = `/account/plex-customer?user=${user}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getPlexCustomerApis: plexCustomerState => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/account/plex-customer-api/${pcid}/all`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getPreferences: plexCustomerState => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/account/preference/${pcid}/all`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getRate: (
        plexCustomerState,
        shipperKey,
        buildingKey,
        selectedService,
        selectedAccount,
        carrier,
        body,
    ) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/${carrier}/get-rate?shipperKey=${shipperKey}&buildingKey=${buildingKey}&selectedService=${selectedService}&selectedAccount=${selectedAccount}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('POST', uri, body, headers);
    },

    getShippers: (plexCustomerState, query) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/plex/get-shippers?options=${JSON.stringify(
            query,
        )}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getShipperForm: (plexCustomerState, shipperKey) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/plex/get-shipper-form?shipperKey=${shipperKey}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getShippedContainers: (plexCustomerState, shipperKey, query) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/plex/get-shipped-containers?shipperKey=${shipperKey}&options=${JSON.stringify(
            query,
        )}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getShipToAddress: (plexCustomerState, shipperKey) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/plex/get-ship-to-address?shipperKey=${shipperKey}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getIntegratedShippingAccounts: (plexCustomerState, query) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/plex/get-integrated-shipping-accounts?options=${JSON.stringify(
            query,
        )}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getIntegratedShippingPackages: (
        plexCustomerState,
        shipperKey,
        integratedShippingProviderTypeKey,
        query,
    ) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/plex/get-integrated-shipping-packages?shipperKey=${shipperKey}&integratedShippingProviderTypeKey=${integratedShippingProviderTypeKey}&options=${JSON.stringify(
            query,
        )}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getIntegratedShippingServices: (plexCustomerState, query) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/plex/get-integrated-shipping-services?options=${JSON.stringify(
            query,
        )}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    getMemoryLog: plexCustomerState => {
        const { sessionToken } = plexCustomerState;
        const uri = `/healthz/memory`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },

    sseConnect: (plexCustomerState, workcenterKey) => {
        const { pcid, sessionToken } = plexCustomerState;
        let uri = `${getBaseUrl()}/transform/${pcid}/sse/sse-connect?channel=${workcenterKey}&auth=${encodeURIComponent(
            sessionToken,
        )}`;
        return new EventSource(uri);
    },

    syncChecksheet: (plexCustomerState, workcenter, checksheetId, body) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/helios/sync-checksheet?workcenter=${workcenter}&checksheetId=${checksheetId}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('POST', uri, body, headers);
    },

    syncShipment: (
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
    ) => {
        const { pcid, sessionToken } = plexCustomerState;
        const headers = getSessionTokenHeader(sessionToken);
        const uri = `/transform/${pcid}/${selectedCarrier.Name}/sync-shipment?shipperKey=${shipperKey}&buildingKey=${shipFrom}&selectedService=${selectedService}&shipperNo=${shipperNo}&selectedAccount=${selectedAccount}&selectedBillTo=${selectedBillTo}&selectedBillingType=${selectedBillingType}&selectedImageType=${selectedImageType}&selectedStockType=${selectedStockType}&integratedShippingServiceKey=${integratedShippingServiceKey}&selectedCarrierProviderTypeKey=${selectedCarrier.Integrated_Shipping_Provider_Type_Key}&selectedShipperProviderTypeKey=${selectedShipper.Integrated_Shipping_Provider_Type_Key}`;
        return requestHandler('POST', uri, body, headers);
    },

    updateControlPlan: (plexCustomerState, checksheetId, body) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/helios/update-control-plan?checksheetId=${checksheetId}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('POST', uri, body, headers);
    },

    updateConnection: (plexCustomerState, service, body) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/connection/${pcid}/${service}/update-connection`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('POST', uri, body, headers);
    },

    updateIntegratedShipper: (plexCustomerState, body) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/plex/update-integrated-shipper`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('POST', uri, body, headers);
    },

    updateIntegratedShippingConfirmation: (plexCustomerState, body) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/plex/update-integrated-shipping-confirmation`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('POST', uri, body, headers);
    },

    updateIntegratedShippingCustomerAddress: (
        plexCustomerState,
        shipperKey,
        validatedAddress,
        customerNo,
        customerAddressNo,
        residential,
        carrier,
    ) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/plex/update-integrated-shipping-customer-address?shipperKey=${shipperKey}&name=${carrier}&customerNo=${customerNo}&customerAddressNo=${customerAddressNo}&residential=${residential}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('POST', uri, validatedAddress, headers);
    },

    updateIntegratedShippingConfirmation: (plexCustomerState, body) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/plex/update-integrated-shipping-confirmation`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('POST', uri, body, headers);
    },

    uploadFiles: (plexCustomerState, body) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/media/${pcid}/upload`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('POST', uri, body, headers);
    },

    validateAddress: (plexCustomerState, shipperKey, carrier, body) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/${carrier}/validate-address?shipperKey=${shipperKey}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('POST', uri, body, headers);
    },

    voidShipment: (plexCustomerState, service, shipperKey, body) => {
        const { pcid, sessionToken } = plexCustomerState;
        const uri = `/transform/${pcid}/${service}/void-shipment?shipperKey=${shipperKey}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('DELETE', uri, body, headers);
    },

    getAccount: (plexCustomerState, user) => {
        const { pcid, sessionToken } = plexCustomerState;
        const { email } = user;
        const uri = `/account?pcid=${pcid}&user=${email}`;
        const headers = getSessionTokenHeader(sessionToken);
        return requestHandler('GET', uri, null, headers);
    },
};
