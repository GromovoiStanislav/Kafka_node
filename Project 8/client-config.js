require('dotenv').config();
const { Kafka, logLevel } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'simply-app',
  brokers: [process.env.KAFKA_HOSTNAME],
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  ssl: true,
  connectionTimeout: 3000, // defoult 1000 ms
  requestTimeout: 25000, // defoult 30000 ms
  retry: {
    initialRetryTime: 100,
    retries: 8
  },
  logLevel: logLevel.INFO
});

kafka.logger()

