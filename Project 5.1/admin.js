import 'dotenv/config';
import { Kafka } from 'kafkajs';

async function createPartition() {
  const kafka = new Kafka({
    brokers: [process.env.KAFKA_HOSTNAME],
    sasl: {
      mechanism: 'scram-sha-256',
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_PASSWORD,
    },
    ssl: true,
  });

  const admin = kafka.admin();
  await admin.connect();

  await admin.createTopics({
    topics: [
      {
        topic: 'my-topic',
        numPartitions: 2,
      },
    ],
  });
  console.log('2 Partitions created');
  await admin.disconnect();
}

createPartition();
