import 'dotenv/config';
import express from 'express';
import eventListner from './event-consumer.js';
const app = express();
const port = process.env.SERVICE_PORT;
eventListner().catch((e) => console.error('error on subscribing to topic'));
app.listen(port, () => {
    console.info(`Activation service running on port ${port}`);
});
