import { Injectable } from "@nestjs/common";
import { Kafka, Producer } from "kafkajs";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class KafkaService {

  public kafka: Kafka;
  public producer: Producer;

  constructor(
    private configService: ConfigService
  ) {
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

    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

}