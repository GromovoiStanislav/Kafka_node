require('dotenv/config');
const { Kafka, Partitioners } = require('kafkajs');

const createKafkaProducer = async () => {
  const kafka = new Kafka({
    clientId: 'kafka-producer-test',
    brokers: [process.env.KAFKA_HOSTNAME],
    sasl: {
      mechanism: 'scram-sha-256',
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_PASSWORD,
    },
    ssl: true,
  });

  const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });

  await producer.connect();

  return producer;
};

module.exports = { createKafkaProducer };
