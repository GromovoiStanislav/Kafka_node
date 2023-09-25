const dotenv = require('dotenv').config();
const WebSocket = require('ws');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { Kafka } = require('kafkajs');

const server = new WebSocket.Server({ port: 8000 });
const jwtKey = fs.readFileSync(process.env.WS_JWT_PUBLIC_KEY, 'utf8');

server.on('connection', function (ws, request) {
  console.log('connected: %s', request.remoteAddress);

  ws.on('message', function (message) {
    const data = JSON.parse(message);
    if (data.type && data.type === 'auth') {
      try {
        const token = jwt.verify(data.token, jwtKey, { algorithms: ['RS256'] });
        console.log('user_id: %s', token.sub);
        ws.user_id = token.sub;
      } catch (err) {
        console.log(err);
      }
    }
  });
});

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: [process.env.KAFKA_HOSTNAME],
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  ssl: true,
});

const consumer = kafka.consumer({ groupId: 'my-group' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'notifications', fromBeginning: true });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      console.log('consumed: %s', message.value.toString());

      const value = JSON.parse(message.value.toString());

      server.clients.forEach((ws) => {
        if (ws.user_id === value.user_id || value.user_id === 'ALL') {
          ws.send(value.message);
        }
      });

      await consumer.commitOffsets([
				{ topic, partition, offset: (Number(message.offset) + 1).toString() },
			]);
    },
  });
};

run().catch(console.error);


