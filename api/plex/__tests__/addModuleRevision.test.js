const { addModuleRevision } = require('../index.js');
const { handleWsReq } = require('../../../../../lib/handle-ws-req');
const { getWsReqBody } = require('../../../../../lib/get-ws-req-body');
const { serverResponse } = require('../../../../../lib/server-response');
const { normalizeError } = require('../../../../../lib/normalize-error');
const { clearConsole } = require('../../../../../lib/test-utils.js');

jest.mock('../../../../../lib/handle-ws-req');
jest.mock('../../../../../lib/get-ws-req-body');
jest.mock('../../../../../lib/server-response');
jest.mock('../../../../../lib/normalize-error');

describe('addModuleRevision tests', () => {
    clearConsole();
    let req, res, next, config;

    beforeEach(() => {
        req = {
            body: {
                applicationKey: 'appKey',
                identityKey: 'idKey',
                moduleKey: 'modKey',
                originalText: 'original text',
                revisionBy: 'revised by',
                revisionDate: '2023-07-15T00:00:00.000Z',
                revisionText: 'revision text',
            },
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        config = {};

        handleWsReq.mockResolvedValue('mocked_ws_response');
        getWsReqBody.mockImplementation(body => body);
        serverResponse.mockImplementation((res, data) => res.json(data));
        normalizeError.mockImplementation(error => `Normalized error: ${error.message}`);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle the request and respond with the result', async () => {
        await addModuleRevision(req, res, next, config);

        expect(getWsReqBody).toHaveBeenCalledWith({
            Application_Key: 'appKey',
            Identity_Key: 'idKey',
            Module_Key: 'modKey',
            Original_Text: 'original text',
            Revision_By: 'revised by',
            Revision_Date: '2023-07-15T00:00:00.000Z',
            Revision_Text: 'revision text',
        });
        expect(handleWsReq).toHaveBeenCalledWith(req, '5650', {
            Application_Key: 'appKey',
            Identity_Key: 'idKey',
            Module_Key: 'modKey',
            Original_Text: 'original text',
            Revision_By: 'revised by',
            Revision_Date: '2023-07-15T00:00:00.000Z',
            Revision_Text: 'revision text',
        });
        expect(serverResponse).toHaveBeenCalledWith(res, 'mocked_ws_response', config);
    });

    it('should handle errors correctly', async () => {
        const error = new Error('Test error');
        handleWsReq.mockRejectedValue(error);

        await addModuleRevision(req, res, next, config);

        expect(normalizeError).toHaveBeenCalledWith(error);
        expect(next).toHaveBeenCalledWith(error);
    });
});
