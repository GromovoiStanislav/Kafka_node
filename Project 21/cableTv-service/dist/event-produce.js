import { Kafka } from 'kafkajs';
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
const producer = kafka.producer();
const eventProducer = async (topic, payload, key) => {
    await producer
        .connect()
        .catch((e) => console.error('error on connecting to Kafka', e));
    if (key) {
        await producer.send({
            topic: topic,
            messages: [{ key: key, value: JSON.stringify(payload) }],
        });
    }
    else {
        await producer.send({
            topic: topic,
            messages: [{ value: JSON.stringify(payload) }],
        });
    }
};
export default eventProducer;
