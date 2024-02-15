import 'dotenv/config';
import { Kafka, Partitioners } from 'kafkajs';

async function produce() {
  const kafka = new Kafka({
    brokers: [process.env.KAFKA_HOSTNAME],
    sasl: {
      mechanism: 'scram-sha-256',
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_PASSWORD,
    },
    ssl: true,
  });

  const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner, // Используем старый разделитель
  });

  await producer.connect();
  console.log('Producer connected');

  await producer.send({
    topic: 'test-topic',
    messages: [{ value: 'Hello Kafka!' }],
  });
  console.log('Message was sent');
  await producer.disconnect();
}

produce();
