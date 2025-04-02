const { updateTruck } = require('../index.js');
const { handleWsReq } = require('../../../../../lib/handle-ws-req');
const { getWsReqBody } = require('../../../../../lib/get-ws-req-body');
const { serverResponse } = require('../../../../../lib/server-response');
const { clearConsole } = require('../../../../../lib/test-utils.js');

jest.mock('../../../../../lib/handle-ws-req');
jest.mock('../../../../../lib/get-ws-req-body');
jest.mock('../../../../../lib/server-response');
jest.mock('../../../../../lib/normalize-error');

describe('updateTruck tests', () => {
    clearConsole();
    let req, res, next, config;

    beforeEach(() => {
        req = {
            query: {
                shipperKey: 'shipper_key',
                selectedCarrierProviderTypeKey: 'provider_key',
            },
            body: {
                addModuleRevision: {
                    truckForm: {
                        identityKey: 'identity_key',
                    },
                },
            },
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        config = {};

        handleWsReq
            .mockResolvedValueOnce({
                data: [
                    {
                        Integrated_Shipping_Provider_Type_Key: 'provider_key',
                        Carrier_No: 'carrier_no',
                    },
                ],
            })
            .mockResolvedValueOnce({
                data: [
                    {
                        Truck_Key: 'truck_key',
                        Truck_Freight_Terms_Key: 'freight_terms_key',
                        Milk_Run_Key: 'milk_run_key',
                        Truck_Status_Key: 'truck_status_key',
                        Truck_Type_Key: 'truck_type_key',
                        Truck_No: 'truck_no',
                        Truck_Ship_Date: 'ship_date',
                        Shipper_Tracking_No: 'tracking_no',
                        Truck_Trailer_No: 'trailer_no',
                        Truck_BOL_Note: 'bol_note',
                        Truck_Note: 'note',
                        Truck_Truck_Called: 'truck_called',
                        Truck_Truck_Called_Date: 'truck_called_date',
                        Truck_Truck_Confirmation: 'truck_confirmation',
                        Truck_Truck_Contact: 'truck_contact',
                        Truck_Truck_Arrival_Time: 'truck_arrival_time',
                        Actual_Time_In: 'actual_time_in',
                        Pit_Time: 'pit_time',
                        Time_Out: 'time_out',
                        BOL_No: 'bol_no',
                        Truck_Scheduled_Ship_Date: 'scheduled_ship_date',
                        Pool: 'pool',
                        Pool_Customer_Address_No: 'pool_customer_address_no',
                        Brokered_Carrier: 'brokered_carrier',
                        Trailer_Carrier: 'trailer_carrier',
                        Trans_Mode: 'trans_mode',
                        Truck_Ship_From: 'ship_from',
                        Truck_Dropship_Supplier_No: 'dropship_supplier_no',
                        Truck_Route: 'truck_route',
                        Truck_Driver_Key: 'driver_key',
                        Truck_Estimated_Arrival_Date: 'estimated_arrival_date',
                        Vessel_Booking_No: 'vessel_booking_no',
                        Truck_Vessel_Name: 'vessel_name',
                        Vessel_Voyage: 'vessel_voyage',
                        Automated_Export_System_No: 'export_system_no',
                        Export_Reason: 'export_reason',
                        INCO_Terms_Key: 'inco_terms_key',
                        Truck_Premium_Trans_Auth: 'premium_trans_auth',
                        Customs_Broker_Supplier_No: 'customs_broker_supplier_no',
                        Sub_Building_Key: 'sub_building_key',
                        Delivery_Appointment_No: 'delivery_appointment_no',
                        Transport_Method_Key: 'transport_method_key',
                        TA_Shipping_Dock_Key: 'shipping_dock_key',
                        TA_Rescheduled: 'rescheduled',
                        TA_Dock_Appointment_Time: 'dock_appointment_time',
                        TA_Customs_Office_Key: 'customs_office_key',
                        TA_Carrier_Origin_Country_Key: 'carrier_origin_country_key',
                        TA_Border_Transport_Mode_Key: 'border_transport_mode_key',
                        TA_Border_Transport_Type_Key: 'border_transport_type_key',
                        TA_Pickup_Location_Key: 'pickup_location_key',
                        TA_Confirmation_Weight: 'confirmation_weight',
                        TA_Cargo_Container_Seal_No: 'cargo_container_seal_no',
                    },
                ],
            });

        getWsReqBody.mockImplementation(body => body);
        serverResponse.mockImplementation((res, data, options) =>
            res.json({ data, options }),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle the request and respond with the result', async () => {
        await updateTruck(req, res, next, config);

        expect(handleWsReq).toHaveBeenNthCalledWith(
            1,
            req,
            '236612',
            getWsReqBody(null),
            config,
        );

        expect(handleWsReq).toHaveBeenNthCalledWith(
            2,
            req,
            '230443',
            getWsReqBody({ Shipper_Key: 'shipper_key' }),
        );

        expect(serverResponse).toHaveBeenNthCalledWith(
            1,
            res,
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        Truck_Key: 'truck_key',
                    }),
                ]),
            }),
            { plain: true },
        );
    });
});
