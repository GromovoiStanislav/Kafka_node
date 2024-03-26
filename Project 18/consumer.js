const { Kafka, logLevel } = require('kafkajs');
const fs = require('node:fs');
const PrettyConsoleLogger = require('./prettyConsoleLogger');

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  logCreator: PrettyConsoleLogger,
  brokers: [process.env.KAFKA_HOSTNAME],
  clientId: 'example-consumer',
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  ssl: true,
});

const topic = 'topic-test';

const consumer = kafka.consumer({ groupId: 'test-group' });

let msgNumber = 0;
const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });
  await consumer.run({
    // eachBatch: async ({ batch }) => {
    //   console.log(batch)
    // },
    eachMessage: async ({ topic, partition, message }) => {
      msgNumber++;
      kafka.logger().info('Message processed', {
        topic,
        partition,
        offset: message.offset,
        timestamp: message.timestamp,
        headers: Object.keys(message.headers).reduce(
          (headers, key) => ({
            ...headers,
            [key]: message.headers[key].toString(),
          }),
          {}
        ),
        key: message.key.toString(),
        value: message.value.toString(),
        msgNumber,
      });
    },
  });
};

run().catch((e) =>
  kafka.logger().error(`[example/consumer] ${e.message}`, { stack: e.stack })
);

const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

errorTypes.map((type) => {
  process.on(type, async (e) => {
    try {
      kafka.logger().info(`process.on ${type}`);
      kafka.logger().error(e.message, { stack: e.stack });
      await consumer.disconnect();
      process.exit(0);
    } catch (_) {
      process.exit(1);
    }
  });
});

signalTraps.map((type) => {
  process.once(type, async () => {
    console.log('');
    kafka.logger().info('[example/consumer] disconnecting');
    await consumer.disconnect();
  });
});
