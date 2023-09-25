require('dotenv').config();
const { Kafka, Partitioners } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'simply-app',
  brokers: [process.env.KAFKA_HOSTNAME],
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  ssl: true,
});

const startProducer = async () => {
  const producer = kafka.producer({
    idempotent: true,
    maxInFlightRequests: 1,
    transactionalId: 'someId',
    createPartitioner: Partitioners.LegacyPartitioner, // Используем старый разделитель
  });

  await producer.connect();
  const transaction = await producer.transaction();

  try {
    await transaction.send({
      topic: 'my-topic',
      messages: [
        {
          key: 'transaction-1',
          value: 'Tsransaction message',
        },
      ],
    });

    // throw new Error('Some error');

    await transaction.commit();
  } catch (err) {
    await transaction.abort();
  }

  await producer.disconnect();
};

const startConsumer = async () => {
  const consumer = kafka.consumer({ groupId: 'simply-group' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'my-topic', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        key: message.key.toString(),
        value: message.value.toString(),
        headers: message.headers,
        topic,
        partition,
      });
    },
  });
};

startProducer().then(startConsumer);
