require('dotenv').config();
const { Kafka, Partitioners } = require('kafkajs');

const TOPIC = 'test-topic';

const kafka = new Kafka({
  clientId: 'test-app',
  brokers: [process.env.KAFKA_HOSTNAME],
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  ssl: true,
});

// Producer
const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner, // DefaultPartitioner LegacyPartitioner
});

const run = async () => {
  // Consumer
  const consumer = kafka.consumer({ groupId: 'test-group' });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        value: message.value.toString(),
        topic: topic,
        partition: partition,
      });
    },
  });
  await producer.connect();
  await producer.send({
    topic: TOPIC,
    messages: [
      {
        value: 'Hello 1',
        key: 'FILL',
      },
      {
        value: 'Hello 2',
        key: 'FILL',
      },
      {
        value: 'Hello 3',
        key: 'FILL',
      },
      {
        value: 'Hello 4',
        key: 'FILL',
      },
      {
        value: 'Hello 5',
        key: '0',
      },
      {
        value: 'Hello 6',
        key: '5sweds',
      },
      {
        value: 'Hello 7',
        key: '6ew',
      },
      {
        value: 'Hello 8',
        key: '0',
      },
      {
        value: 'Hello 9',
        key: '5sweds',
      },
      {
        value: 'Hello 10',
        key: '6eweqeq',
      },
    ],
  });
};

run().catch(() => {
  console.log('Got error in setup consumer');
});
