import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { Consumer, ConsumerRunConfig, ConsumerSubscribeTopics, Kafka } from "kafkajs";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ConsumerService implements OnApplicationShutdown {

  private readonly consumers: Consumer[] = [];

  private readonly kafka = new Kafka({
    brokers: [this.configService.get<string>("KAFKA_HOSTNAME")],
    sasl: {
      mechanism: "scram-sha-256",
      username: this.configService.get<string>("KAFKA_USERNAME"),
      password: this.configService.get<string>("KAFKA_PASSWORD")
    },
    ssl: true
  });


  constructor(
    private readonly configService: ConfigService
  ) {
  }


  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }


  async consume(
    groupId: string,
    topics: ConsumerSubscribeTopics,
    config: ConsumerRunConfig
  ) {
    const consumer: Consumer = this.kafka.consumer({ groupId: groupId });
    await consumer.connect().catch((e) => console.error(e));
    await consumer.subscribe(topics);
    await consumer.run(config);
    this.consumers.push(consumer);
  }
}