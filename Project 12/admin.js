require('dotenv').config();
const { Kafka } = require('kafkajs');

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

const createTopicWithPart = async () => {
  const admin = kafka.admin();
  await admin.connect();
  const topicConfig = {
    topic: TOPIC,
    numPartitions: 5,
    replicationFactor: 1,
  };
  await admin.createTopics({
    topics: [topicConfig],
  });

  console.log(await admin.listTopics());

  await admin.disconnect();
};

createTopicWithPart().then(() => {
  console.log('====================');
});
