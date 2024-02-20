import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConsumerService } from "src/kafka/consumer.service";

@Injectable()
export class CreateConsumer implements OnModuleInit {

  constructor(
    private readonly _consumer: ConsumerService
  ) {
  }

  async onModuleInit() {
    this._consumer.consume(
      "create-client",
      { topics: ["create-employee"] },
      {
        eachMessage: async ({ topic, partition, message }) => {
          console.log({
            source: "create-consumer",
            message: message.value.toString(),
            partition: partition.toString(),
            topic: topic.toString()
          });
        }
      }
    );
  }
}