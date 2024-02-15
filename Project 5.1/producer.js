import 'dotenv/config';
import { Kafka, Partitioners } from 'kafkajs';

async function produce() {
  const kafka = new Kafka({
    brokers: [process.env.KAFKA_HOSTNAME],
    sasl: {
      mechanism: 'scram-sha-256',
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_PASSWORD,
    },
    ssl: true,
  });

  const jerseyNumber = process.argv[2];

  const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner, // Используем старый разделитель
  });

  await producer.connect();
  console.log('Producer connected');

  const players = {
    7: 'Dhoni',
    18: 'Virat',
    12: 'Yuvraj',
    10: 'Sachin',
    45: 'Rohit',
  };

  const producedData = await producer.send({
    topic: 'my-topic',
    messages: [
      {
        value: players[jerseyNumber],
        partition: jerseyNumber <= 10 ? 0 : 1,
      },
    ],
  });
  console.log(`Produced data ${JSON.stringify(producedData)}`);

  setTimeout(producer.disconnect, 500);
}

produce();
