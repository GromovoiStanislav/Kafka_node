import { Kafka } from 'kafkajs';
import eventProducer from './event-produce.js';
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
    const consumer = kafka.consumer({
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
            const newMessage = JSON.parse(message.value?.toString() || '{}');
            if (!(newMessage?.type === 'payment-complete')) {
                console.info(`incomming message is not activation type. (${newMessage?.type}) skipped the process`);
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 12000));
            await eventProducer(process.env.RESPOND_TOPIC || 'error', {
                from: process.env.SERVICE_NAME,
                type: 'activation-complete',
                key: newMessage?.key,
                result: 'success',
            }).catch((e) => {
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
