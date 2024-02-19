import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Consumer, ConsumerSubscribeTopic, ConsumerRunConfig, Kafka } from "kafkajs";


@Injectable()
export class ConsumerService implements OnApplicationShutdown {

  private readonly kafka: Kafka;
  private readonly consumers: Consumer[] = [];

  constructor(
    private readonly configService: ConfigService
  ) {
    this.kafka = new Kafka({
      brokers: [this.configService.get<string>("KAFKA_HOSTNAME")],
      sasl: {
        mechanism: "scram-sha-256",
        username: this.configService.get<string>("KAFKA_USERNAME"),
        password: this.configService.get<string>("KAFKA_PASSWORD")
      },
      ssl: true
    });


  }

  async consume(topic: ConsumerSubscribeTopic, config: ConsumerRunConfig) {
    const consumer = this.kafka.consumer({ groupId: "nestjs-kafka" });
    await consumer.connect();
    await consumer.subscribe(topic);
    await consumer.run(config);
    this.consumers.push(consumer);
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}