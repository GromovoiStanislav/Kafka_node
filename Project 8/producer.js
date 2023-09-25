require('dotenv').config();
const { Kafka, Partitioners } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'simply-app',
  brokers: [process.env.KAFKA_HOSTNAME],
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  ssl: true,
});


const startProducer = async () => {
  const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner, // Используем старый разделитель
  });

  await producer.connect()

  await producer.send({
    topic: 'my-topic',
    messages: [
      { value: "My first message" }
    ],
  });

  await producer.disconnect()
}


const startConsumer = async () => {
  const consumer = kafka.consumer({ groupId: 'simply-group' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'my-topic', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({value: message.value.toString()});
    },
  });
}



startProducer().then(startConsumer)