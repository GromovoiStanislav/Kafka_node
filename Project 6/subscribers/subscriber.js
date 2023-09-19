require('dotenv').config();
const { Kafka } = require('kafkajs');
const fibonacci = require('../math-logic/fibonacci-series');

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

const consumer = kafka.consumer({ groupId: 'my-group' });

const topicName = 'fib-topic';

async function runConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: topicName, fromBeginning: true });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      try {
        // Ваш код обработки сообщения здесь
        const num = message.value; // <Buffer>
        // console.log(typeof num.toString()); // string
        // console.log(typeof parseInt(num));  //  number

        const fibNum = await fibonacci(parseInt(num));
        console.log("Received '%s' - Fibonacci '%d'", num, fibNum);

        // Если обработка прошла успешно, выполните коммит
        await consumer.commitOffsets([
          { topic, partition, offset: (Number(message.offset) + 1).toString() },
        ]);
        console.log(`Committed offset for message at offset ${message.offset}`);
      } catch (error) {
        console.error(`Error processing message: ${error}`);
      }
    },
  });

  console.log('[*] Waiting for messages. To exit press CTRL+C');
}

runConsumer().catch((error) => {
  console.error(error);
  process.exit(0);
});
