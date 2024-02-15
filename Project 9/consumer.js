import 'dotenv/config';
import { Kafka } from 'kafkajs';

async function consume() {
  const kafka = new Kafka({
    brokers: [process.env.KAFKA_HOSTNAME],
    sasl: {
      mechanism: 'scram-sha-256',
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_PASSWORD,
    },
    ssl: true,
  });

  const consumer = kafka.consumer({ groupId: 'my-group' });
  await consumer.connect();
  console.log('Consumer connected');

  await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        value: message.value.toString(),
      });
    },
  });
}

consume();
