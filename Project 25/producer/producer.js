// import { Kafka } from "kafkajs";
// import { randomUUID } from "node:crypto";
const { Kafka } = require('kafkajs');
const { randomUUID } = require('node:crypto');

async function bootstrap() {
  const kafka = new Kafka({
    brokers: [process.env.KAFKA_HOSTNAME],
    sasl: {
      mechanism: 'scram-sha-256',
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_PASSWORD,
    },
    ssl: true,
  });

  const producer = kafka.producer();

  await producer.connect();
  await producer.send({
    topic: 'notifications.send-notification',
    messages: [
      {
        value: JSON.stringify({
          content: 'New request',
          category: 'social',
          recipientId: randomUUID(),
        }),
      },
    ],
  });
  await producer.disconnect();
}

bootstrap();
