import { Kafka, Consumer, Producer } from 'kafkajs';
import { WebSocketServer } from 'ws';
import config from './config.js';

const wss = new WebSocketServer({
  port: parseInt(config.port, 10),
});

function broadcast(data) {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(data));
  });
}

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: [...config.kafka.brokers],
  sasl: {
    mechanism: 'scram-sha-256',
    username: config.kafka.username,
    password: config.kafka.password,
  },
  ssl: true,
  retry: {
    maxRetryTime: Infinity,
  },
});

async function BrokerConnect(client: Consumer | Producer): Promise<void> {
  try {
    await client.connect();
  } catch (e) {
    console.log('Unable to connect consumer -> ', e);
    setTimeout(BrokerConnect, 2000);
  }
}

setInterval(async () => {
  const producer = kafka.producer();
  await BrokerConnect(producer);
  await producer.send({
    topic: config.kafka.topics[0],
    messages: [{ value: 'TEST' }],
  });
  await producer.disconnect();
}, 10000);

(async () => {
  const consumer = kafka.consumer({ groupId: config.kafka.consumerGroupId });
  await BrokerConnect(consumer);
  await Promise.all(
    config.kafka.topics.map((topic) =>
      consumer.subscribe({ topic, fromBeginning: true })
    )
  );
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const wsMessage = {
        value: message.value.toString(),
      };

      console.log(wsMessage);
      broadcast(wsMessage);
    },
  });
})();
