import 'dotenv/config';
import { Kafka, Partitioners } from 'kafkajs';

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

const publish = async () => {
  await producer
    .connect()
    .catch((e) => console.error('error on connecting to Kafka', e));

  for (let i = 0; i < 9; i++) {
    await producer.send({
      topic: 'dev',
      messages: [
        { key: 'a', value: JSON.stringify({ empName: 'Nairobi ' + i }) },
      ],
    });
  }
};
publish().catch((e) => console.error(e));
