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

  const consumer = kafka.consumer({ groupId: 'my-topic-group' });
  await consumer.connect();
  console.log('Consumer connected');

  await consumer.subscribe({
    topic: 'my-topic',
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // 1. topic
      // 2. partition
      // 3. message

      console.log(
        `To Partition ${partition} -> message ${message.value.toString()}`
      );
    },
  });
}

consume();
