import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MyKafkaProducer } from './producer.js';
import { MyKafkaConsumer } from './consumer.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT ?? 3000;
const kafkaTopicName = process.env.TOPIC_NAME ?? 'my-topic';
const kafkaClientId = process.env.CLIENT_ID ?? 'client-id';
const kafkaHostName = process.env.KAFKA_HOSTNAME ?? '';
const kafkaUserName = process.env.KAFKA_USERNAME ?? '';
const kafkaPassword = process.env.KAFKA_PASSWORD ?? '';
// KAFKA
const kafka = new MyKafkaProducer(kafkaHostName, kafkaUserName, kafkaPassword, kafkaClientId, kafkaTopicName);
async function connectToKafka() {
    await kafka.connect();
}
await connectToKafka();
// KAFKA CONSUMER
async function connectToKafkaConsumer() {
    const kafka = new MyKafkaConsumer(kafkaHostName, kafkaUserName, kafkaPassword, kafkaClientId, kafkaTopicName);
    await kafka.startConsumer();
}
await connectToKafkaConsumer();
const app = express();
app.use(express.static('public'));
app.use(express.urlencoded());
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.post('/', (req, res) => {
    const { message } = req.body;
    const log = { sentAt: new Date(Date.now()), message };
    kafka.sendMessage(JSON.stringify(log));
    return res.redirect('/');
});
app.listen(port, () => {
    console.log(`Сервер запущен по адресу http://localhost:${port}/`);
});
