import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "../database/database.service";
import { IConsumer } from "./consumer.interface";
import { KafkajsConsumer } from "./kafkajs.consumer";
import { KafkajsConsumerOptions } from "./kafkajs-consumer-options.interface";


@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly consumers: IConsumer[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService
  ) {
  }

  async consume({ topics, config, onMessage }: KafkajsConsumerOptions) {
    const consumer = new KafkajsConsumer(
      topics,
      this.databaseService,
      config,
      this.configService.get<string>("KAFKA_HOSTNAME"),
      this.configService.get<string>("KAFKA_USERNAME"),
      this.configService.get<string>("KAFKA_PASSWORD"),
      "scram-sha-256"
    );
    await consumer.connect();
    await consumer.consume(onMessage);
    this.consumers.push(consumer);
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}