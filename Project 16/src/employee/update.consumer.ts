import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConsumerService } from "src/kafka/consumer.service";

@Injectable()
export class UpdateConsumer implements OnModuleInit {

  constructor(
    private readonly _consumer: ConsumerService
  ) {
  }

  async onModuleInit() {
    this._consumer.consume(
      "update-client",
      { topics: ["update-employee"] },
      {
        eachMessage: async ({ topic, partition, message }) => {
          console.log({
            source: "update-consumer",
            message: message.value.toString(),
            partition: partition.toString(),
            topic: topic.toString()
          });
        }
      }
    );
  }
}