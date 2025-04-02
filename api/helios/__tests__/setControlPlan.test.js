const { setControlPlan } = require('../index');
const { getWorkcenters, getFullControlPlanDocuments } = require('../../plex');
const { validateControlPlan } = require('../validators');
const {
    getPlexCustomerByAuthType,
} = require('../../../../connection/services/plexCustomerService');
const {
    createControlPlan,
    purgeControlPlans,
} = require('../../../repositories/controlPlanRepository');
const { getControlPlanAssets } = require('../util/getControlPlanAssets');
const { formatChecksheetResponse } = require('../util/formatChecksheetResponse');
const { sseBroadcast } = require('../../sse');
const { serverResponse } = require('../../../../../lib/server-response');
const { normalizeError } = require('../../../../../lib/normalize-error');

jest.mock('../../plex');
jest.mock('../validators');
jest.mock('../../../../connection/services/plexCustomerService');
jest.mock('../../../repositories/controlPlanRepository');
jest.mock('../util/getControlPlanAssets');
jest.mock('../util/formatChecksheetResponse');
jest.mock('../../sse');
jest.mock('../../../../../lib/server-response');
jest.mock('../../../../../lib/normalize-error');

describe('setControlPlan', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                controlPlanHeader: {
                    workcenter: 123,
                    controlPlanKey: 1,
                    partNo: 456,
                    operationId: 789,
                    inspectionMode: 1,
                    mesRule: 'someRule',
                    note: 'a note',
                },
            },
        };

        res = {
            json: jest.fn(),
        };

        next = jest.fn();

        getWorkcenters.mockReset();
        getFullControlPlanDocuments.mockReset();
        validateControlPlan.mockReset();
        getPlexCustomerByAuthType.mockReset();
        purgeControlPlans.mockReset();
        createControlPlan.mockReset();
        getControlPlanAssets.mockReset();
        formatChecksheetResponse.mockReset();
        sseBroadcast.mockReset();
        serverResponse.mockReset();
        normalizeError.mockReset();
    });

    it('responds with active checksheet', async () => {
        getWorkcenters.mockResolvedValue();
        const fakeFullControlPlan = { data: [{ PLC_Name: 'Test PLC' }] };
        getFullControlPlanDocuments.mockResolvedValue(fakeFullControlPlan);
        validateControlPlan.mockReturnValue(fakeFullControlPlan);
        getPlexCustomerByAuthType.mockResolvedValue({ customerId: 'cust123' });
        // Include Workcenter_Code and Control_Plan_Header.note for the active branch
        const fakeQueuedControlPlan = {
            Active: true,
            Control_Plan_Key: 42,
            Control_Plan_Header: { note: 'a note' },
            Workcenter_Code: 'W123',
        };
        purgeControlPlans.mockResolvedValue(1);
        createControlPlan.mockResolvedValue(fakeQueuedControlPlan);
        const fakeControlPlanAssets = { data: { some: 'assetData' } };
        getControlPlanAssets.mockResolvedValue(fakeControlPlanAssets);
        formatChecksheetResponse.mockReturnValue('formatted response');
        sseBroadcast.mockResolvedValue('broadcast response');

        serverResponse.mockImplementation((res, payload) => {
            res.json(payload);
        });

        await setControlPlan(req, res, next);

        expect(serverResponse).toHaveBeenCalledWith(res, {
            message: 'Checksheet active',
            checksheetId: fakeQueuedControlPlan.Control_Plan_Key,
            workcenterKey: req.body.controlPlanHeader.workcenter,
            workcenterCode: fakeQueuedControlPlan.Workcenter_Code,
            broadcast: 'broadcast response',
            checksheet: 'formatted response',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('responds with queued checksheet', async () => {
        getWorkcenters.mockResolvedValue();
        const fakeFullControlPlan = { data: [{ PLC_Name: 'Test PLC' }] };
        getFullControlPlanDocuments.mockResolvedValue(fakeFullControlPlan);
        validateControlPlan.mockReturnValue(fakeFullControlPlan);
        getPlexCustomerByAuthType.mockResolvedValue({ customerId: 'cust123' });
        // For queued branch include Workcenter_Code property
        const fakeQueuedControlPlan = {
            Active: false,
            Control_Plan_Key: 42,
            Workcenter_Code: 'W123',
        };
        createControlPlan.mockResolvedValue(fakeQueuedControlPlan);
        const fakeControlPlanAssets = { data: { some: 'assetData' } };
        getControlPlanAssets.mockResolvedValue(fakeControlPlanAssets);
        formatChecksheetResponse.mockReturnValue('formatted response');

        serverResponse.mockImplementation((res, payload) => {
            res.json(payload);
        });

        await setControlPlan(req, res, next);

        expect(serverResponse).toHaveBeenCalledWith(res, {
            message: 'Checksheet queued',
            checksheetId: fakeQueuedControlPlan.Control_Plan_Key,
            workcenterKey: req.body.controlPlanHeader.workcenter,
            workcenterCode: fakeQueuedControlPlan.Workcenter_Code,
            checksheet: 'formatted response',
        });
        expect(sseBroadcast).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });
});
