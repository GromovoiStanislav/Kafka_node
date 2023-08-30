import 'dotenv/config';
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  brokers: [process.env.KAFKA_HOSTNAME],
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  ssl: true,
});

const consumer = kafka.consumer({
  groupId: 'project',
  //this is to disable retry on faulure during process. so it start with last commited offset instead of first offset of the batch
  retry: {
    initialRetryTime: 100,
    retries: 0,
  },
});
await consumer.connect();
await consumer.subscribe({ topic: 'dev', fromBeginning: false });

console.log('[x] To exit press CTRL+C');
console.log('Listening for messages...');

await consumer.run({
  autoCommit: false,
  eachMessage: async ({ topic, partition, message }) => {
    const { message: msg } = JSON.parse(message.value.toString());
    console.log('Message received:', msg);

    //is used to make sure previous message (which committed last) not come back to re process
    await consumer.commitOffsets([
      {
        topic,
        partition,
        offset: (Number(message.offset) + 1).toString(),
      },
    ]);
    //console.log('offset set to ', Number(message.offset) + 1);
  },
});
