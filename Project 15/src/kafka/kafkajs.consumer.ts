import { Logger } from "@nestjs/common";
import { Consumer, ConsumerConfig, ConsumerSubscribeTopic, Kafka, KafkaMessage } from "kafkajs";
import { sleep } from "../utils/sleep";
import { IConsumer } from "./consumer.interface";

export class KafkajsConsumer implements IConsumer {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;
  private readonly logger: Logger;

  constructor(
    private readonly topic: ConsumerSubscribeTopic,
    config: ConsumerConfig,
    broker: string,
    username: string,
    password: string,
    mechanism
  ) {
    this.kafka = new Kafka({
      brokers: [broker],
      sasl: {
        mechanism,
        username,
        password
      },
      ssl: true
    });
    this.consumer = this.kafka.consumer(config);
    this.logger = new Logger(`${topic.topic} ${config.groupId}`);
  }

  async consume(onMessage: (message: KafkaMessage) => Promise<void>) {
    await this.consumer.subscribe(this.topic);
    await this.consumer.run({
      eachMessage: async ({ message, partition }) => {
        this.logger.debug(`Processing message partition: ${partition}`);
        await onMessage(message);
      }
    });
  }

  async connect() {
    try {
      await this.consumer.connect();
    } catch (err) {
      this.logger.error("Failed to connect to Kafka.", err);
      await sleep(5000);
      await this.connect();
    }
  }

  async disconnect() {
    await this.consumer.disconnect();
  }
}