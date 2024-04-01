import 'dotenv/config';
import express from 'express';
import eventListner from './event-consumer.js';
import { NewConnectionService } from './service/newConnection.service.js';
const app = express();
const port = process.env.SERVICE_PORT;
eventListner().catch((e) => console.error('error on subscribing to topic'));
app.use(express.json());
app.post('/connection', async (request, response, next) => {
    if (request.body.passportNumber == undefined ||
        request.body.type != 'NEW_CONNECTION') {
        console.error(`invalid request. passportNumber: ${request.body.passportNumber} type: ${request.body.type}`);
        response.status(400).send({ message: 'Invalid request body' });
    }
    console.debug(`new connection request initiated for ${request.body.passportNumber}`);
    const newConnectionService = new NewConnectionService();
    const uniqueId = await newConnectionService
        .initiateNewConnection(request.body.passportNumber)
        .catch((e) => {
        console.error(e);
        response.status(500).send();
    });
    response.status(200).send({ id: uniqueId });
});
app.get('/connection/:passportNumber', async (request, response, next) => {
    const newConnectionService = new NewConnectionService();
    const connectionStatus = await newConnectionService
        .getConnectionStatus(request.params.passportNumber, request.query.activationId?.toString())
        .catch((e) => {
        response.status(400).send();
    });
    response.status(200).send(connectionStatus);
});
app.listen(port, () => {
    console.info(`New Connection service running on port ${port}`);
});
