import { Injectable } from "@nestjs/common";
import { KafkaService } from "../kafka/kafka.service";

@Injectable()
export class HelloService {

  private topic = "test-topic";

  constructor(
    private readonly kafkaService: KafkaService
  ) {
  }

  async onModuleInit() {
    await this.consumeMessages();
  }


  async sendMessage(message: string) {
    return await this.kafkaService.producer.send({
      topic: this.topic,
      messages: [{ value: message }]
    });
  }


  async consumeMessages() {
    const consumer = this.kafkaService.kafka.consumer({ groupId: "group-id" });
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
