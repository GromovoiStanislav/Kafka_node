import { Body, Controller, Post } from "@nestjs/common";
import { KafkaService } from "./kafka.service";

@Controller("kafka")
export class KafkaController {

  constructor(
    private readonly kafkaService: KafkaService
  ) {
  }

  @Post("send")
  async sendKafkaMessage(@Body() message: { value: string }) {
    return await this.kafkaService.sendMessage(message.value);
  }

}