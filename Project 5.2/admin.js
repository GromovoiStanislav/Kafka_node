import 'dotenv/config';
import { Kafka } from 'kafkajs';

const run = async () => {
  try {
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
          topic: 'Users',
          numPartitions: 2,
        },
      ],
    });
    console.log('Created Successfully!');
    await admin.disconnect();
  } catch (err) {
    console.error(`Something bad happened ${err}`);
  } finally {
    process.exit(0);
  }
};

run();
