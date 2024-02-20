import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit
} from "@nestjs/common";
import { Kafka, Producer, ProducerRecord } from "kafkajs";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {

  private readonly kafka = new Kafka({
    brokers: [this.configService.get<string>("KAFKA_HOSTNAME")],
    sasl: {
      mechanism: "scram-sha-256",
      username: this.configService.get<string>("KAFKA_USERNAME"),
      password: this.configService.get<string>("KAFKA_PASSWORD")
    },
    ssl: true
  });

  private readonly producer: Producer = this.kafka.producer();

  constructor(
    private readonly configService: ConfigService
  ) {
  }

  async onApplicationShutdown() {
    await this.producer.disconnect();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async produce(record: ProducerRecord) {
    await this.producer.send(record);
  }
}