import { Injectable, OnModuleInit } from "@nestjs/common";
import { Consumer, Kafka } from "kafkajs";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class KafkaConsumer implements OnModuleInit {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private configService: ConfigService
  ) {
    this.kafka = new Kafka({
      clientId: "my-app1",
      brokers: [this.configService.get<string>("KAFKA_HOSTNAME")],
      sasl: {
        mechanism: "scram-sha-256",
        username: this.configService.get<string>("KAFKA_USERNAME"),
        password: this.configService.get<string>("KAFKA_PASSWORD")
      },
      ssl: true
    });

    this.consumer = this.kafka.consumer({ groupId: "my-group" });
  }

  async onModuleInit() {
    await this.consumer.connect();

    await this.consumer.subscribe({
      topic: "test-topic2",
      fromBeginning: true
    });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        // 1. topic
        // 2. partition
        // 3. message
        console.log(
          `To Partition ${partition} -> message ${message.value.toString()}`
        );
      }
    });

  }


}