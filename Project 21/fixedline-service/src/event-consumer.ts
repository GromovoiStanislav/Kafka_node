import { Consumer, Kafka } from 'kafkajs';
import eventProducer from './event-produce.js';
import { Event } from './types/event.js';

const eventListner = async () => {
  const kafka = new Kafka({
    clientId: process.env.CLIENT_ID,
    brokers: [process.env.KAFKA_HOSTNAME],
    sasl: {
      mechanism: 'scram-sha-256',
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_PASSWORD,
    },
    ssl: true,
  });

  const consumer: Consumer = kafka.consumer({
    groupId: process.env.CONSUMER_GROUP || 'default',
    retry: { retries: 0 },
  });

  console.info(`subscribing to ${process.env.LISTEN_TOPIC || 'error'}`);
  await consumer
    .subscribe({
      topic: process.env.LISTEN_TOPIC || 'error',
      fromBeginning: true,
    })
    .catch((e) => console.error(e));

  await consumer.run({
    autoCommit: false,
    
    eachMessage: async ({ topic, partition, message }) => {
      console.debug(`new message : ${message.value?.toString()}`);

      const newMessage: Event = JSON.parse(message.value?.toString() || '{}');

      if (!(newMessage?.type === 'NEW_CONNECTION')) {
        console.info(
          `incomming message is not New connection type. (${newMessage?.type}) skipped the process`
        );
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 10000));

      await eventProducer(process.env.RESPOND_TOPIC || 'error', {
        from: process.env.SERVICE_NAME,
        type: 'fixedLine',
        key: newMessage?.key,
        result: 'success',
      } as Event).catch((e) => {
        throw new Error('error on publishing message');
      });

      console.debug('responded to message');

      await consumer.commitOffsets([
        {
          topic,
          partition,
          offset: (Number(message.offset) + 1).toString(),
        },
      ]);
    },
  });
};

export default eventListner;
