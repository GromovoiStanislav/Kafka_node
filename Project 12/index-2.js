require('dotenv').config();
const express = require('express');
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

// Consumer
const consumerSetup = async () => {
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
};

consumerSetup().catch(() => {
  console.log('Got error in setup consumer');
});

// Producer
const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner, // DefaultPartitioner LegacyPartitioner
});

// Define a route for the root URL
const app = express();
const port = 3000; // Port number for the server

app.post('/hello', async (req, res) => {
  await producer.send({
    topic: TOPIC,
    messages: [{ value: 'Hello KafkaJS!' }],
  });
  res.send('Hello, World!');
});

// Start the server
app.listen(port, async () => {
  await producer.connect();
  console.log(`Server is listening at http://localhost:${port}`);
});
