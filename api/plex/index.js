const { DEPRECATED_handlePlexReq } = require('../../../../lib/handle-plex-req');
const { handleWsReq } = require('../../../../lib/handle-ws-req');
const { getWsReqBody } = require('../../../../lib/get-ws-req-body');
const { serverResponse } = require('../../../../lib/server-response');
const {
    formatCustomerAddressBody,
} = require('../../../../lib/format-customer-address-body');
const { getPackagingOptions } = require('../../../../lib/get-packaging-options');
const { getEnabledCarriers } = require('../../../feature/services/featureService');
const { normalizeError } = require('../../../../lib/normalize-error');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    /**
     * boilerplate for use with any Plex (non-WebService) API call
     */
    DEPRECATED_plexTemplate: (req, res, next, config = {}) => {
        const uri = '/mdm/v1/parts'; // use any uri to validate it works
        return DEPRECATED_handlePlexReq(req, res, next, uri, null, config); // todo, add body handler for POST requests
    },

    addModuleRevision: async (req, res, next, config = {}) => {
        const {
            applicationKey,
            identityKey,
            moduleKey,
            originalText,
            revisionBy,
            revisionDate,
            revisionText,
        } = req.body;

        try {
            return serverResponse(
                res,
                await handleWsReq(
                    req,
                    '5650',
                    getWsReqBody({
                        Application_Key: applicationKey,
                        Identity_Key: identityKey,
                        Module_Key: moduleKey,
                        Original_Text: originalText,
                        Revision_By: revisionBy,
                        Revision_Date: revisionDate || new Date().toISOString(),
                        Revision_Text: revisionText,
                    }),
                ),
                config,
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    addIntegratedShippingTrackingNo: async (
        req,
        res,
        next,
        containerKey,
        trackingNo,
        useTrackingNo,
        config = {},
    ) => {
        try {
            return serverResponse(
                res,
                await handleWsReq(
                    req,
                    '237645',
                    getWsReqBody({
                        Container_Key: containerKey,
                        Shipper_Key: req.query.shipperKey,
                        Tracking_No: trackingNo,
                        Use_Tracking_No: useTrackingNo,
                    }),
                ),
                config,
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    addChecksheetWithMeasurements: async (req, res, next, config = {}) => {
        try {
            let measurementXML = '<Measurements>';
            req.body.checksheet.forEach(line => {
                const { PLC_Name, Measurement } = line;

                for (key in Measurement) {
                    if (Measurement[key].value !== null) {
                        measurementXML += `
                        <Measurement>
                            <PLCName>${PLC_Name}</PLCName>
                            <Value>${Measurement[key].value}</Value>
                        </Measurement>
                    `;
                    }
                }
            });
            measurementXML += '</Measurements>';

            return serverResponse(
                res,
                await handleWsReq(
                    req,
                    '233805',
                    getWsReqBody({
                        Checksheet_Note: req.body?.note || '',
                        Inspection_Mode:
                            req.body.checksheet[0].Inspection_Mode_Description,
                        Measurement_XML: measurementXML,
                        Operation_No: req.body.checksheet[0].Operation_No,
                        Part_No: req.body.checksheet[0].Part_No,
                    }),
                ),
                config,
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    addCustomerAddress: async (req, res, config = {}) => {
        return serverResponse(
            res,
            await handleWsReq(req, '18357', getWsReqBody(req.body)),
            config,
        );
    },

    addSalesOrder: async (req, res, config = {}) => {
        return serverResponse(
            res,
            await handleWsReq(req, '18351', getWsReqBody(req.body)),
            config,
        );
    },

    addSalesOrderLineItem: async (req, res, config = {}) => {
        return serverResponse(
            res,
            await handleWsReq(req, '18349', getWsReqBody(req.body)),
            config,
        );
    },

    deleteIntegratedShippingTrackingNo: async (req, res, next, body, config = {}) => {
        try {
            return serverResponse(
                res,
                await handleWsReq(
                    req,
                    '236610',
                    getWsReqBody({
                        Container_Key: body.containerKey,
                        // Master_Unit_Key: body.masterUnitKey,
                        Shipper_Key: body.shipperKey, // required
                    }),
                ),
                config,
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    getPickerWorkcenters: async (req, res, next, config = {}) => {
        try {
            req.query.options = {
                fields: ['Workcenter_Key', 'Workcenter_Code'],
            };
            return serverResponse(
                res,
                await handleWsReq(req, '595', getWsReqBody(null), config),
                config,
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    getBuildings: async (req, res, config = {}) => {
        return serverResponse(
            res,
            await handleWsReq(req, '167', getWsReqBody(null)),
            config,
        );
    },

    getTruckTypes: async (commonCarrier, req, res, config = {}) => {
        return serverResponse(
            res,
            await handleWsReq(
                req,
                '4820',
                getWsReqBody({ Common_Carrier: commonCarrier }),
            ),
            config,
        );
    },

    getCustomerAddressBuilding: async (req, res, next, config = {}) => {
        try {
            return serverResponse(
                res,
                await handleWsReq(
                    req,
                    '18092',
                    getWsReqBody(
                        req.query.buildingKey
                            ? { Building_Key: req.query.buildingKey }
                            : null,
                    ),
                ),
                config,
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    getCustomerAddress: async (req, res, next, config = {}) => {
        try {
            return serverResponse(
                res,
                await handleWsReq(
                    req,
                    '2578',
                    getWsReqBody({
                        Customer_No: req.query.customerNo,
                        Customer_Address_No: req.query.customerAddressNo,
                    }),
                ),
                config,
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    getCustomerAddressIntegratedShippingProviderAccounts: async (
        req,
        res,
        next,
        config = {},
    ) => {
        try {
            return serverResponse(
                res,
                await handleWsReq(req, '16495', getWsReqBody(null)),
                config,
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    getCustomerAddressResidentialClassification: async (req, res, next) => {
        try {
            const address = await handleWsReq(
                req,
                '28',
                getWsReqBody({
                    Customer_No: req.query.customerNo,
                    Customer_Address_No: req.query.customerAddressNo,
                }),
            );
            if (address && address.errors) return res.status(400).json(address);

            if (!address || !Array.isArray(address?.data))
                throw new Error('Address not found.');

            const plexResidentialClassification =
                address.data.length > 0 ? address.data[0]?.Residential || false : false;
            return serverResponse(res, plexResidentialClassification);
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    getCustomerNo: async (req, res, config = {}) => {
        return serverResponse(
            res,
            await handleWsReq(
                req,
                '230',
                getWsReqBody({ Customer_Code: req.query.customerCode }),
            ),
            config,
        );
    },

    getPart: async (req, res, config = {}) => {
        return serverResponse(
            res,
            await handleWsReq(req, '583', getWsReqBody({ Part_No: req.body.partNo })),
            config,
        );
    },

    getFullControlPlanDocuments: async (
        req,
        res,
        queuedControlPlan = null,
        config = {},
    ) => {
        const controlPlanHeader = queuedControlPlan
            ? queuedControlPlan.Control_Plan_Header
            : req.body.controlPlanHeader;
        const { controlPlanNo, inspectionMode, partNo, primeOperation, operationId } =
            controlPlanHeader;

        req.query.options = {
            fields: ['Specification_Description', 'Target', 'Lower_Limit', 'Upper_Limit'],
            hidden: [
                'Specification_No',
                'Tolerance_Type',
                'Control_Plan_Line_Note',
                'Part_Name',
                'Part_No',
                'Inspection_Mode_Description',
                'PLC_Name',
                'Sample_Size',
                'Control_Plan_Document_Names',
                'Control_Plan_Line_Document_Names',
                'Operation_No',
                // todo.. add additional output columns per John's request
                // CPL.Gage_Type,
                // CPL.Gage_Note,
                // CPL.Note AS Control_Plan_Line_Note,
                // CPL.Controlling_Factors,
                // CPL.Tool,
                // CPL.Reaction_Plan_Key,
                // CPL.Control_Method_Key,
            ],
        };
        const controlPlan = await handleWsReq(
            req,
            '238833',
            getWsReqBody({
                Control_Plan_No: controlPlanNo,
                Part_No: partNo,
                Prime_Operation: primeOperation,
                Inspection_Mode: inspectionMode, // alias Inspection_Mode_Description
            }),
        );

        const getMeasurementAttributes = el => {
            const size = el.Sample_Size || 1;
            const measurmentObj = {};
            for (let i = 0; i < size; i++) {
                measurmentObj[`${i}`] = {
                    value: null,
                    inRange: null,
                };
            }
            return measurmentObj;
        };

        const controlPlanWithVirtualFields = controlPlan.data.map(el => ({
            ...el,
            Measurement: getMeasurementAttributes(el),
            Control_Plan_Line_Documents: [], // assign docs from Blob storage
            Control_Plan_Documents: [],
        }));

        const columnsWithVirtualFields = [
            ...controlPlan.columns,
            'Measurement',
            //'Control_Plan_Line_Documents', // hide the `Ref` column until the customer decides they want it..
        ];

        const editableControlPlan = {
            ...controlPlan,
            columns: columnsWithVirtualFields,
            data: controlPlanWithVirtualFields.map(el => ({
                Virtual_Key: uuidv4(),
                ...el,
            })),
            editable: ['Measurement'],
        };
        return serverResponse(res, editableControlPlan, config);
    },

    getIntegratedShippingAccounts: async (req, res, next, config = {}) => {
        try {
            // filter for non-customer accounts
            const integratedShippingAccounts = await handleWsReq(
                req,
                '16470',
                getWsReqBody(null),
            );
            const customerAddressIntegratedShippingProviderAccounts = await handleWsReq(
                req,
                '16495',
                getWsReqBody(null),
            );
            const filteredAccounts = integratedShippingAccounts.data.filter(account => {
                return !customerAddressIntegratedShippingProviderAccounts.data.some(
                    customerAccount => {
                        return (
                            customerAccount.Integrated_Shipping_Account ===
                            account.Integrated_Shipping_Account &&
                            customerAccount.Account_No === account.Account_No
                        );
                    },
                );
            });
            const responseObj = {
                status: integratedShippingAccounts.status,
                columns: integratedShippingAccounts.columns,
                hidden: integratedShippingAccounts.hidden,
                data: filteredAccounts,
            };
            return serverResponse(res, responseObj, config);
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    DEPRECATED_getIntegratedShippingBillTos: async (req, res, next, config = {}) => {
        try {
            const parsed = JSON.parse(req.query.options);
            const keys = parsed.integratedShippingProviderTypeKeys;

            if (keys) {
                const result = await handleWsReq(req, '236605', getWsReqBody(null));
                const filteredResult = result.data
                    .filter(el => keys.includes(el.Integrated_Shipping_Provider_Type_Key))
                    .map(el => {
                        return {
                            ...el,
                            Integrated_Shipping_Provider_Type_Key:
                                el.Integrated_Shipping_Provider_Type_Key,
                        };
                    });
                const responseObj = { ...result };
                responseObj.data = filteredResult;
                return serverResponse(res, responseObj, config);
            }
            return serverResponse(
                res,
                await handleWsReq(req, '236605', getWsReqBody(null)),
                config,
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    getIntegratedShippingPackages: async (req, res, next, config = {}) => {
        try {
            const packages = await handleWsReq(
                req,
                '234308',
                getWsReqBody({
                    Shipper_Key: req.query.shipperKey,
                }),
            );

            const isMultiPackage = packages.data.length > 1;
            // Call getPackagingOptions with package length info
            const packagingOptions = getPackagingOptions(req, isMultiPackage);

            // Append Declared_Value, Packaging_Type, and Dummy_Type options to each package
            const packagesWithDeclaredValue = packages.data.map(pkg => ({
                ...pkg,
                Declared_Value: null,
                Packaging_Type: packagingOptions[0].value, // its probably okay to hard code a default value
                // Dummy_Type: null, // in case we need to extend dropdown selectable fields
            }));

            // Append Declared_Value, Packaging_Type, and Dummy_Type to the columns array
            const columnsWithDeclaredValue = [
                ...packages.columns,
                'Declared_Value',
                'Packaging_Type',
                // 'Dummy_Type', // in case we need to extend dropdown selectable fields
            ];

            const editablePackages = {
                ...packages,
                columns: columnsWithDeclaredValue,
                data: packagesWithDeclaredValue.map(el => ({
                    Virtual_Key: uuidv4(),
                    ...el,
                })),
                selectable: {
                    packagingOptions: packagingOptions,
                    // dummyOptions: [ // in case we need to extend dropdown selectable fields
                    //     { label: 'Do', value: 'Do' },
                    //     { label: 'Re', value: 'Re' },
                    //     { label: 'Me', value: 'Me' },
                    // ],
                },
                editable: ['Length', 'Width', 'Height', 'Weight', 'Declared_Value'],
            };

            return serverResponse(res, editablePackages, config);
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    getIntegratedShippingServices: async (req, res, next, config = {}) => {
        try {
            const parsed = JSON.parse(req.query.options);
            const keys = parsed.integratedShippingProviderTypeKeys;

            if (keys) {
                const result = await handleWsReq(
                    req,
                    '236612',
                    getWsReqBody(
                        req.query.carrierNo ? { Carrier_No: req.query.carrierNo } : null,
                    ),
                );
                const filteredResult = result.data.filter(el =>
                    keys.includes(el.Integrated_Shipping_Provider_Type_Key),
                );
                const responseObj = { ...result };
                responseObj.data = filteredResult;
                return serverResponse(res, responseObj, config);
            }
            return serverResponse(
                res,
                await handleWsReq(
                    req,
                    '236612',
                    getWsReqBody(
                        req.query.carrierNo ? { Carrier_No: req.query.carrierNo } : null,
                    ),
                ),
                config,
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    getIntegratedShippingServiceTypes: async (req, res, next, config = {}) => {
        try {
            return serverResponse(
                res,
                await handleWsReq(
                    req,
                    '16349',
                    getWsReqBody(
                        req.query.serviceType
                            ? { Service_Type: req.query.serviceType }
                            : null,
                    ),
                ),
                config,
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    getShippedContainers: async (req, res, next, config = {}) => {
        try {
            return serverResponse(
                res,
                await handleWsReq(
                    req,
                    '2233',
                    getWsReqBody({
                        Shipper_Key: req.query.shipperKey,
                    }),
                ),
                config,
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    getShipperForm: async (req, res, next, config = {}) => {
        try {
            const shipperForm = await handleWsReq(
                req,
                '2068',
                getWsReqBody({ Shipper_Key: req.query.shipperKey }),
            );

            const customerAddress = await handleWsReq(
                req,
                '2578',
                getWsReqBody({
                    Customer_No: shipperForm.data[0].Customer_No,
                    Customer_Address_No: shipperForm.data[0].Customer_Address_No,
                }),
            );

            // include Contact_Note
            const modifiedShipperForm = {
                ...shipperForm,
                data: shipperForm.data.map(item => ({
                    ...item,
                    Contact_Note: customerAddress.data[0].Contact_Note,
                })),
            };

            return serverResponse(res, modifiedShipperForm, config);
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    /**
     * filter Shippers by enabled carrier
     */
    getShippers: async (req, res, next, config = {}) => {
        try {
            const enabledCarriers = await getEnabledCarriers();
            const keys = enabledCarriers.map(
                carrier => carrier.dataValues.Integrated_Shipping_Provider_Type_Key,
            );
            const shippers = await handleWsReq(req, '9278', getWsReqBody(null));

            if (!keys) return serverResponse(res, shippers);
            const modifiedReq = { ...req, query: { ...req.query, options: undefined } };
            const services = await handleWsReq(modifiedReq, '236612', getWsReqBody(null));

            const carrierToTypeKey = new Map(
                services?.data
                    ?.filter(item =>
                        keys.includes(item.Integrated_Shipping_Provider_Type_Key),
                    )
                    .map(item => [
                        item.Carrier_No,
                        item.Integrated_Shipping_Provider_Type_Key,
                    ]),
            );

            const filteredShippers = shippers?.data
                ?.filter(shipper => carrierToTypeKey.has(shipper.Carrier))
                .map(shipper => ({
                    ...shipper,
                    Integrated_Shipping_Provider_Type_Key: carrierToTypeKey.get(
                        shipper.Carrier,
                    ),
                }));

            const shipperMap = new Map(
                filteredShippers.map(shipper => [shipper.Shipper_Key, shipper]),
            );

            const uniqueShippers = Array.from(shipperMap.values());

            return serverResponse(res, { ...shippers, data: uniqueShippers }, config);
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    getWorkcenters: async (req, res, config = {}) => {
        const { controlPlanHeader } = req.body;
        const { workcenter } = controlPlanHeader;

        const result = await serverResponse(
            res,
            await handleWsReq(
                req,
                '21783',
                getWsReqBody({
                    Workcenter_Key: workcenter,
                }),
            ),
            config,
        );

        if (!result || result?.data?.length === 0) {
            const error = new Error(`workcenter ${workcenter} is not found`);
            error.status = 404;
            throw error;
        }

        return result;
    },

    updateCustomerShipperSimple: async (req, res, next, config = {}) => {
        try {
            return serverResponse(
                res,
                await handleWsReq(
                    req,
                    '230447',
                    getWsReqBody({
                        Shipper_Key: req.query.shipperKey,
                        Tracking_No: req.body.trackingNo,
                        Shipper_Note: req.body.shipperNote,
                    }),
                ),
                config,
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    updateIntegratedShipper: async (req, res, next, config = {}) => {
        try {
            return serverResponse(
                res,
                await handleWsReq(
                    req,
                    '237535',
                    getWsReqBody({
                        Shipper_Key: req.query.shipperKey,
                        Integrated_Shipping_Service_Key:
                            req.query.integratedShippingServiceKey,
                    }),
                ),
                config,
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    updateIntegratedShippingConfirmation: async (req, res, next, config = {}) => {
        try {
            const getRequestBody = req => {
                if (req.query.selectedBillingType === 'BILL_SHIPPER') {
                    return {
                        Shipper_Key: req.query.shipperKey,
                        Actual_Rate: req.body.actualRate,
                        Confirmation_Date: req.body.confirmationDate,
                        Standard_Rate: req.body.standardRate,
                        Tracking_No: req.body.trackingNo,
                    };
                }

                return {
                    Shipper_Key: req.query.shipperKey, // exclude Actual and Standard_Rate
                    Confirmation_Date: req.body.confirmationDate,
                    Tracking_No: req.body.trackingNo,
                };
            };

            return serverResponse(
                res,
                await handleWsReq(req, '236608', getWsReqBody(getRequestBody(req))),
                config,
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    updateIntegratedShippingCustomerAddress: async (req, res, next) => {
        try {
            const body = await formatCustomerAddressBody(req);
            return serverResponse(
                res,
                await handleWsReq(req, '236613', getWsReqBody(body)),
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    updateShipperFreight: async (req, res, next, config = {}) => {
        try {
            const getRequestBody = req => {
                if (req.query.selectedBillingType === 'BILL_SHIPPER') {
                    return {
                        Shipper_Key: req.query.shipperKey,
                        Tracking_No: req.body.trackingNo,
                        Freight_Amount: req.body.actualRate,
                    };
                }

                return {
                    Shipper_Key: req.query.shipperKey,
                    Tracking_No: req.body.trackingNo,
                };
            };

            return serverResponse(
                res,
                await handleWsReq(req, '20945', getWsReqBody(getRequestBody(req))),
                config,
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },

    updateTruck: async (req, res, next, config = {}) => {
        try {
            const services = await handleWsReq(req, '236612', getWsReqBody(null), config);

            const matchingService = services.data.find(
                service =>
                    service.Integrated_Shipping_Provider_Type_Key ==
                    req.query.selectedCarrierProviderTypeKey,
            );

            const carrierNo = matchingService?.Carrier_No;

            const detailedShipperInfo = await serverResponse(
                res,
                await handleWsReq(
                    req,
                    '230443',
                    getWsReqBody({
                        Shipper_Key: req.query.shipperKey,
                    }),
                ),
                { plain: true },
            );

            const {
                Truck_Ship_Date,
                Shipper_Tracking_No,
                Truck_Trailer_No,
                Truck_BOL_Note,
                Truck_Note,
                Truck_Truck_Called,
                Truck_Truck_Called_Date,
                Truck_Truck_Confirmation,
                Truck_Truck_Contact,
                Truck_Truck_Arrival_Time,
                Actual_Time_In,
                Pit_Time,
                Time_Out,
                BOL_No,
                Truck_Scheduled_Ship_Date,
                Pool,
                Pool_Customer_Address_No,
                Brokered_Carrier,
                Trailer_Carrier,
                Trans_Mode,
                Truck_Ship_From,
                Truck_Dropship_Supplier_No,
                Truck_Route,
                Truck_Driver_Key,
                Truck_Estimated_Arrival_Date,
                Vessel_Booking_No,
                Truck_Vessel_Name,
                Vessel_Voyage,
                Automated_Export_System_No,
                Export_Reason,
                INCO_Terms_Key,
                Truck_Premium_Trans_Auth,
                Customs_Broker_Supplier_No,
                Sub_Building_Key,
                Delivery_Appointment_No,
                Transport_Method_Key,
                TA_Shipping_Dock_Key,
                TA_Rescheduled,
                TA_Dock_Appointment_Time,
                TA_Customs_Office_Key,
                TA_Carrier_Origin_Country_Key,
                TA_Border_Transport_Mode_Key,
                TA_Border_Transport_Type_Key,
                TA_Pickup_Location_Key,
                TA_Confirmation_Weight,
                TA_Cargo_Container_Seal_No,
                // "required" fields
                Truck_Key,
                Truck_Freight_Terms_Key,
                Milk_Run_Key,
                Truck_Status_Key,
                Truck_Type_Key,
                Truck_No,
            } = detailedShipperInfo.data[0];

            let modifiedReq = {
                ...req,
                body: {
                    ...req.body,
                    addModuleRevision: {
                        truckForm: {
                            ...req.body.addModuleRevision.truckForm,
                            identityKey: Truck_Key,
                        },
                    },
                },
            };

            modifiedReq = {
                ...req,
                body: {
                    ...modifiedReq.body.addModuleRevision.truckForm,
                },
            };

            // explicitly update the truck form revision history
            await module.exports.addModuleRevision(modifiedReq, res, next, {
                plain: true,
            });

            return serverResponse(
                res,
                await handleWsReq(
                    req,
                    '8733',
                    getWsReqBody({
                        // "required" fields
                        Carrier: carrierNo,
                        Truck_Key: Truck_Key,
                        Freight_Terms_Key: Truck_Freight_Terms_Key,
                        Milk_Run_Key: Milk_Run_Key,
                        Truck_Status_Key: Truck_Status_Key,
                        Truck_Type_Key: Truck_Type_Key,
                        Truck_No: Truck_No,
                        // update all others so they aren't nullified
                        Ship_Date: Truck_Ship_Date,
                        Tracking_No: Shipper_Tracking_No,
                        Trailer_No: Truck_Trailer_No,
                        BOL_Note: Truck_BOL_Note,
                        Note: Truck_Note,
                        Truck_Called: Truck_Truck_Called,
                        Truck_Called_Date: Truck_Truck_Called_Date,
                        Truck_Confirmation: Truck_Truck_Confirmation,
                        Truck_Contact: Truck_Truck_Contact,
                        Truck_Arrival_Time: Truck_Truck_Arrival_Time,
                        Actual_Time_In: Actual_Time_In,
                        Pit_Time: Pit_Time,
                        Time_Out: Time_Out,
                        BOL_No: BOL_No,
                        Scheduled_Ship_Date: Truck_Scheduled_Ship_Date,
                        Pool: Pool,
                        Pool_Customer_Address_No: Pool_Customer_Address_No,
                        Brokered_Carrier: Brokered_Carrier,
                        Trailer_Carrier: Trailer_Carrier,
                        Trans_Mode: Trans_Mode,
                        Ship_From: Truck_Ship_From,
                        Dropship_Supplier_No: Truck_Dropship_Supplier_No,
                        Truck_Route: Truck_Route,
                        Truck_Driver_Key: Truck_Driver_Key,
                        Estimated_Arrival_Date: Truck_Estimated_Arrival_Date,
                        Vessel_Booking_No: Vessel_Booking_No,
                        Vessel_Name: Truck_Vessel_Name,
                        Vessel_Voyage: Vessel_Voyage,
                        Automated_Export_System_No: Automated_Export_System_No,
                        Export_Reason: Export_Reason,
                        INCO_Terms_Key: INCO_Terms_Key,
                        Premium_Trans_Auth: Truck_Premium_Trans_Auth,
                        Customs_Broker_Supplier_No: Customs_Broker_Supplier_No,
                        Sub_Building_Key: Sub_Building_Key,
                        Delivery_Appointment_No: Delivery_Appointment_No,
                        Transport_Method_Key: Transport_Method_Key,
                        Shipping_Dock_Key: TA_Shipping_Dock_Key,
                        Rescheduled: TA_Rescheduled,
                        Dock_Appointment_Time: TA_Dock_Appointment_Time,
                        Customs_Office_Key: TA_Customs_Office_Key,
                        Carrier_Origin_Country_Key: TA_Carrier_Origin_Country_Key,
                        Border_Transport_Mode_Key: TA_Border_Transport_Mode_Key,
                        Border_Transport_Type_Key: TA_Border_Transport_Type_Key,
                        Pickup_Location_Key: TA_Pickup_Location_Key,
                        Confirmation_Weight: TA_Confirmation_Weight,
                        Cargo_Container_Seal_No: TA_Cargo_Container_Seal_No,
                    }),
                ),
                config,
            );
        } catch (error) {
            console.trace(normalizeError(error));
            next(error);
        }
    },
};
