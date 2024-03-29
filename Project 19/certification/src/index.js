import { Kafka, logLevel } from 'kafkajs';

const kafka = new Kafka({
  logLevel: logLevel.WARN,
  brokers: [process.env.KAFKA_HOSTNAME],
  clientId: 'certificate',
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  ssl: true,
});

const topic = 'issue-certificate';
const consumer = kafka.consumer({ groupId: 'certificate-group' });
const producer = kafka.producer();

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic });
  await producer.connect();

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
      console.log(`- ${prefix} ${message.key}#${message.value}`);

      const payload = JSON.parse(message.value);

      setTimeout(() => {
        producer.send({
          topic: 'certification-response',
          messages: [
            {
              value: `Certificat for user ${payload.user.name} by course ${payload.course} created!`,
            },
          ],
        });
      }, 3000);
    },
  });
};

run().catch(console.error);
