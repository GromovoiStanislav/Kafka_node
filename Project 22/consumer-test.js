require('dotenv/config');
const { Kafka } = require('kafkajs');

async function createKafkaConsumer() {
  const kafka = new Kafka({
    clientId: 'my-consumer',
    brokers: [process.env.KAFKA_HOSTNAME],
    sasl: {
      mechanism: 'scram-sha-256',
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_PASSWORD,
    },
    ssl: true,
  });

  const consumer = kafka.consumer({ groupId: 'test-group' });

  try {
    await consumer.connect();
    console.log('Kafka consumer connected successfully');
  } catch (error) {
    console.error('Error connecting to Kafka:', error);
  }

  return consumer;
}

module.exports = { createKafkaConsumer };
