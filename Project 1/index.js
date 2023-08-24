require('dotenv').config();
const { Kafka, Partitioners, logLevel, CompressionTypes } = require('kafkajs');

const kafka = new Kafka({
  brokers: [process.env.HOSTNAME],
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
  },
  ssl: true,
  //logLevel: logLevel.ERROR,
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner, // Используем старый разделитель
});

const consumer = kafka.consumer({
  groupId: 'test-dev-4',
});

const run = async () => {
  // Producing
  await producer.connect();
  await producer.send({
    topic: 'dev',
    compression: CompressionTypes.GZIP,
    messages: [
      {
        //key: 'key1',
        //partition: 0,
        value: 'Hello KafkaJS!',
        headers: {
          'correlation-id': '2bfb68bb-893a-423b-a7fa-7b568cad5b67',
          'system-id': 'my-system',
        },
      },
    ],
  });

  // Consuming
  await consumer.connect();
  await consumer.subscribe({ topic: 'dev', fromBeginning: true });

  await consumer.run({
    autoCommit: false, // Default: true
    partitionsConsumedConcurrently: 3, // Default: 1
    eachMessage: async ({ topic, partition, message }) => {
      const headersAsString = {};

      for (const headerName in message.headers) {
        const headerValue = message.headers[headerName].toString();
        headersAsString[headerName] = headerValue;
      }

      console.log({
        partition,
        timestamp: message.timestamp,
        offset: message.offset,
        key: message.key?.toString(),
        value: message.value.toString(),
        headers: headersAsString,
      });
    },
  });

  // Manual committing:
  // consumer.seek({ topic: 'dev', partition: 0, offset: 0 });
  // consumer.seek({ topic: 'dev', partition: 1, offset: 0 });
  // consumer.seek({ topic: 'dev', partition: 2, offset: 0 });
  // consumer.seek({ topic: 'dev', partition: 3, offset: 0 });
  // consumer.seek({ topic: 'dev', partition: 4, offset: 0 });
  //or
  // consumer.commitOffsets([
  //   { topic: 'dev', partition: 0, offset: '0' },
  //   { topic: 'dev', partition: 1, offset: '0' },
  //   { topic: 'dev', partition: 2, offset: '0' },
  //   { topic: 'dev', partition: 3, offset: '0' },
  //   { topic: 'dev', partition: 4, offset: '0' },
  // ]);
};

run().catch(console.error);
