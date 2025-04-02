const { StatusCodes } = require('http-status-codes');
const request = require('supertest');
const express = require('express');
const { exec } = require('../transformController');
const { fedExService, upsService, plexService } = require('../../services');
const { clearConsole } = require('../../../../lib/test-utils');

jest.mock('../../services/fedExService', () => ({
    exec: jest.fn().mockImplementation((req, res, next) => {
        res.status(200).send('Mocked FedEx response');
    }),
}));

jest.mock('../../services/upsService', () => ({
    exec: jest.fn().mockImplementation((req, res, next) => {
        res.status(200).send('Mocked UPS response');
    }),
}));

jest.mock('../../services/plexService', () => ({
    exec: jest.fn().mockImplementation((req, res, next) => {
        res.status(200).send('Mocked Plex response');
    }),
}));

const app = express();
app.use(express.json());
app.post('/transform/:service', exec); // mock route

describe('transformController test', () => {
    clearConsole();

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call fedExService.exec when service is fedEx', async () => {
        const response = await request(app).post('/transform/fedEx');
        expect(fedExService.exec).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(StatusCodes.OK);
        expect(response.text).toBe('Mocked FedEx response');
    });

    it('should call upsService.exec when service is ups', async () => {
        const response = await request(app).post('/transform/ups');
        expect(upsService.exec).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(StatusCodes.OK);
        expect(response.text).toBe('Mocked UPS response');
    });

    it('should call plexService.exec when service is plex', async () => {
        const response = await request(app).post('/transform/plex');
        expect(plexService.exec).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(StatusCodes.OK);
        expect(response.text).toBe('Mocked Plex response');
    });

    it('should return a 400 status code and message when the service is unrecognized', async () => {
        const response = await request(app).post('/transform/unknownService');
        expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        expect(response.text).toBe('Service not found: unknownService');
    });
});
