const { Kafka, logLevel } = require('kafkajs');
const express = require('express');
const app = express();

app.use(express.json());

// Configuration for the Kafka brokers
const kafkaConfig = {
  brokers: [process.env.KAFKA_HOSTNAME],
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  ssl: true,
};

// Create Kafka producer
const kafkaProducer = new Kafka({
  clientId: 'rail_app_producer',
  logLevel: logLevel.NOTHING,
  ...kafkaConfig,
}).producer();

// Connect the Kafka producer
const initKafkaProducer = async () => {
  await kafkaProducer.connect();
  console.log('Producer connected successfully');
};

app.post('/topic/TRAIN_MVT_ALL_TOC', function (req, res) {
  const body = req.body;
  const timestamp = new Date().toISOString();

  if (body.msg_type) {
    if (body.msg_type === '0001') {
      // Train Activation
      const stanox = body.tp_origin_stanox || body.sched_origin_stanox || 'N/A';

      // Send the message to Kafka
      sendToKafka('train_activation', {
        timestamp,
        trainId: body.train_id,
        stanox,
      });
    } else if (body.msg_type === '0002') {
      // Train Cancellation
      const stanox = body.loc_stanox || 'N/A';
      const reasonCode = body.canx_reason_code || 'N/A';

      // Send the message to Kafka
      sendToKafka('train_cancellation', {
        timestamp,
        trainId: body.train_id,
        stanox,
        reasonCode,
      });
    }
  }

  res.send('OK');
});

app.listen(3000, async () => {
  // Initialize Kafka producer
  await initKafkaProducer();
});

async function sendToKafka(topic, message) {
  try {
    // Use KafkaJS producer to send message to Kafka
    await kafkaProducer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(message),
        },
      ],
    });

    console.log(`Message sent to Kafka topic "${topic}":`, message);
  } catch (error) {
    console.error('Error sending message to Kafka:', error.message);
  }
}
