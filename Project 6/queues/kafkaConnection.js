const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: [process.env.KAFKA_HOSTNAME],
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  ssl: true,
});

const producer = kafka.producer();
let isConnected = false;

async function connectToKafka() {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
  }
}

async function closeConnection() {
  if (isConnected) {
    await producer.disconnect();
    isConnected = false;
  }
}

async function sendMessage(topic, message) {
  await producer.send({
    topic,
    messages: [{ value: message }],
  });
}

module.exports = { connectToKafka, closeConnection, sendMessage };
