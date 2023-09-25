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
    createPartitioner: Partitioners.LegacyPartitioner, // Используем старый разделитель
  });

  await producer.connect();

  const messages = [
    {
      topic: 'topic-a',
      messages: [
        {
          key: 'key-a',
          value: 'message to topic a',
        },
      ],
    },
    {
      topic: 'topic-b',
      messages: [
        {
          key: 'key-b',
          value: 'message to topic b',
        },
      ],
    },
  ];

  await producer.sendBatch({ topicMessages: messages });

  await producer.disconnect();
};

const startConsumer = async () => {
  const consumer = kafka.consumer({ groupId: 'simply-group' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'topic-a', fromBeginning: true });
  await consumer.subscribe({ topic: 'topic-b', fromBeginning: true });

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
