import { Injectable } from "@nestjs/common";
import { KafkaProducer } from "./cmd/kafka.producer";

@Injectable()
export class AppService {

  constructor(
    private readonly kafkaProducer: KafkaProducer
  ) {
  }

  getHello(): string {
    this.kafkaProducer.produce("test-topic", {
      point: "/",
      data: new Date().toISOString() // new Date().getTime()
    });

    this.kafkaProducer.produce("test-topic2", {
      point: "/",
      data: new Date().getTime() //new Date().toISOString()
    });
    return "Hello World!";
  }

}
