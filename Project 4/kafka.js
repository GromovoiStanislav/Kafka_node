import { Kafka, Partitioners } from 'kafkajs';

class KafkaClient {
  constructor() {}

  static instance;
  isInitialized = false;
  producer;
  consumer;

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    this.kafka = new Kafka({
      clientId: 'nodejs-kafka',
      brokers: [process.env.KAFKA_HOSTNAME],
      sasl: {
        mechanism: 'scram-sha-256',
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
      },
      ssl: true,
    });

    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner, // Используем старый разделитель
    });
    await this.producer.connect();

    this.consumer = this.kafka.consumer({ groupId: 'test-group' });
    await this.consumer.connect();

    this.isInitialized = true;
  }

  async produce(topic, messages) {
    try {
      await this.producer.send({
        topic: topic,
        messages: messages,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async consume(topic, callback) {
    try {
      await this.consumer.subscribe({ topic: topic, fromBeginning: true });
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const value = message.value.toString();
          callback(value);
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new KafkaClient();
    }
    return this.instance;
  }
}

export default KafkaClient.getInstance();
