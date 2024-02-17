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

const consumer = kafka.consumer({ groupId: 'test-group' });
async function runConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(
        `Received message on topic ${topic}, partition ${partition}: ${message.value}`
      );
    },
  });
}

runConsumer().catch(console.error);

// Producer
const producer = kafka.producer({
  createPartitioner: Partitioners.DefaultPartitioner, // DefaultPartitioner LegacyPartitioner
});

// Define a route for the root URL
const app = express();
const port = 3000;

app.post('/hello', async (req, res) => {
  producer.send({
    topic: TOPIC,
    messages: [
      {
        value: JSON.stringify({
          a: 1,
          b: 2,
        }),
      },
    ],
  });

  res.send('Hello, World!');
});

// Start the server
app.listen(port, async () => {
  await producer.connect();
  console.log(`Server is listening at http://localhost:${port}`);
});
