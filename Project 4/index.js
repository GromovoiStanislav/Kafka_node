import 'dotenv/config.js';
import express from 'express';
import constrollers from './controller.js';
import KafkaClient from './kafka.js';

const app = express();
app.use(express.json());

app.get('/', async (req, res) => {
  res.status(200).json({
    status: 'Ok!',
    message: 'Hello world',
  });
});

app.post('/send', constrollers.sendMessageToKafka);

await KafkaClient.initialize();

KafkaClient.consume('my-topic', (value) => {
  console.log('📨 Receive message: ', value);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
