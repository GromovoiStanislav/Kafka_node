require('dotenv').config();
const { Kafka, Partitioners } = require('kafkajs');

const run = async () => {
  const kafka = new Kafka({
    clientId: 'qa-topic',
    logLevel: 2,
    brokers: [process.env.KAFKA_HOSTNAME],
    sasl: {
      mechanism: 'scram-sha-256',
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_PASSWORD,
    },
    ssl: true,
  });

  // Consuming
  const consumer = kafka.consumer({ groupId: 'my-group' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'supplier-ratings', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const msg = JSON.parse(message.value.toString());
      console.log({
        partition,
        offset: message.offset,
        value: JSON.stringify(msg, null, 4),
      });
    },
  });

  // Producing
  const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner, // Используем старый разделитель
  });
  producer.on('producer.connect', () => {
    console.log(`KafkaProvider: connected`);
  });
  producer.on('producer.disconnect', () => {
    console.log(`KafkaProvider: could not connect`);
  });
  producer.on('producer.network.request_timeout', (payload) => {
    console.log(`KafkaProvider: request timeout ${payload.clientId}`);
  });

  await producer.connect();
  await producer.send({
    topic: 'supplier-ratings',
    messages: [
      {
        value: Buffer.from(
          JSON.stringify({
            event_name: 'QA',
            external_id: '5a12cba8-f4b5-495b-80ea-d0dd5d4ee17e',
            payload: {
              supplier_id: '5a12cba8-f4b5-495b-80ea-d0dd5d4ee17e',
              assessment: {
                performance: 7,
                quality: 7,
                communication: 7,
                flexibility: 7,
                cost: 7,
                delivery: 6,
              },
            },
            metadata: {
              user_uuid: '5a12cba8-f4b5-495b-80ea-d0dd5d4ee17e',
            },
          })
        ),
      },
    ],
  });
};

run();
