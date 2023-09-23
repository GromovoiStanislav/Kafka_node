require('dotenv').config();
const { Kafka } = require('kafkajs');

const userIds = process.argv.slice(2);
if (!userIds.length) {
  console.error('Не указаны пользовательские идентификаторы.');
  process.exit(1);
}

const kafka = new Kafka({
  clientId: 'my-app-producer',
  brokers: [process.env.KAFKA_HOSTNAME],
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  ssl: true,
});

const producer = kafka.producer();

const topicName = 'notifications';

const connect = async () => {
  try {
    await producer.connect();
    console.log('Producer connected to Kafka broker');
    console.log(' [x] To exit press CTRL+C.');
    console.log('Type a message...');
  } catch (error) {
    console.error('Error occurred:', error);
  }
};
connect();

function getRandomUser() {
  const randomIndex = Math.floor(Math.random() * userIds.length);
  return userIds[randomIndex];
}

process.stdin.on('data', async (chunk) => {
  const str = chunk.toString().trim();
  if (str === 'exit') {
    await producer.disconnect();
    process.exit(0);
  }
  const message = { user_id: getRandomUser(), message: str };
  await producer.send({
    topic: topicName,
    messages: [{ value: JSON.stringify(message) }],
  });
});

process.once('SIGINT', async () => {
  await producer.disconnect();
  process.exit(0);
});
