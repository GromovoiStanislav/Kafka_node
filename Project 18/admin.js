const { Kafka, logLevel } = require('kafkajs');
const PrettyConsoleLogger = require('./prettyConsoleLogger');

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  logCreator: PrettyConsoleLogger,
  brokers: [process.env.KAFKA_HOSTNAME],
  clientId: 'example-admin',
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  ssl: true,
});

const topic = 'topic-test';

const admin = kafka.admin();

const run = async () => {
  await admin.connect();
  await admin.createTopics({
    topics: [{ topic }],
    waitForLeaders: true,
  });
  await admin.createPartitions({
    topicPartitions: [{ topic: topic, count: 3 }],
  });
};

run().catch((e) =>
  kafka.logger().error(`[example/admin] ${e.message}`, { stack: e.stack })
);

const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

errorTypes.map((type) => {
  process.on(type, async (e) => {
    try {
      kafka.logger().info(`process.on ${type}`);
      kafka.logger().error(e.message, { stack: e.stack });
      await admin.disconnect();
      process.exit(0);
    } catch (_) {
      process.exit(1);
    }
  });
});

signalTraps.map((type) => {
  process.once(type, async () => {
    console.log('');
    kafka.logger().info('[example/admin] disconnecting');
    await admin.disconnect();
  });
});
