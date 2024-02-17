import { Injectable } from "@nestjs/common";
import { Kafka, Producer } from "kafkajs";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class KafkaService {

  private kafka: Kafka;
  private producer: Producer;
  private topic: string;

  constructor(private configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: "my-app",
      brokers: [this.configService.get<string>("KAFKA_HOSTNAME")],
      sasl: {
        mechanism: "scram-sha-256",
        username: this.configService.get<string>("KAFKA_USERNAME"),
        password: this.configService.get<string>("KAFKA_PASSWORD")
      },
      ssl: true
    });
  }

  async onModuleInit() {
    this.topic = "test-topic";
    this.producer = this.kafka.producer();
    await this.producer.connect();
    await this.consumeMessages();
  }

  async sendMessage(message: string) {
    return await this.producer.send({
      topic: this.topic,
      messages: [{ value: message }]
    });
  }

  async consumeMessages() {
    const consumer = this.kafka.consumer({ groupId: "group-id" });
    await consumer.connect();

    await consumer.subscribe({ topic: this.topic, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        // Handle the received message
        console.log({
          topic,
          partition,
          value: message.value.toString()
        });
      }
    });
  }
}
