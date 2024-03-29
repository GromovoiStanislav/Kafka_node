import { Kafka, logLevel } from 'kafkajs';
import express from 'express';
import routes from './routes.js';

const kafka = new Kafka({
  logLevel: logLevel.WARN,
  brokers: [process.env.KAFKA_HOSTNAME],
  clientId: 'api',
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  ssl: true,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'certificate-group-receiver' });

const app = express();

app.use((req, res, next) => {
  req.producer = producer;

  return next();
});

app.use(routes);

const run = async () => {
  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({ topic: 'certification-response' });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log('Response', String(message.value));
    },
  });

  app.listen(process.env.PORT);
};

run().catch(console.error);
