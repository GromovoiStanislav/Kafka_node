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

  const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner, // Используем старый разделитель
  });

  await producer.connect();
  console.log('Producer connected');

  const msg = process.argv[2];
  //A-M 0 , N-Z 1
  const partition = msg[0] < 'N' ? 0 : 1;
  const result = await producer.send({
    topic: 'Users',
    messages: [
      {
        value: msg,
        partition: partition,
      },
    ],
  });

  console.log(`Send Successfully! ${JSON.stringify(result)}`);
  await producer.disconnect();
}

produce();
