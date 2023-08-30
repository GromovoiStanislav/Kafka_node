import 'dotenv/config';
import { Kafka, Partitioners } from 'kafkajs';

const kafka = new Kafka({
  brokers: [process.env.KAFKA_HOSTNAME],
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  ssl: true,
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner, // Используем старый разделитель
});

const connect = async () => {
  await producer
    .connect()
    .catch((e) => console.error('error on connecting to Kafka', e));
};
connect().catch((e) => console.error(e));

console.log('[x] To exit type "exit" or press CTRL+C');
console.log('Type a message...');

process.stdin.on('data', (chunk) => {
  const str = chunk.toString().trim();
  if (str === 'exit') {
    process.exit(0);
  }

  producer.send({
    topic: 'dev',
    messages: [{ key: 'a', value: JSON.stringify({ message: str }) }],
  });
});
