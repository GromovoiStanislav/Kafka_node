import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

@Controller()
export class KafkaConsumer {

  constructor() {
  }

  @MessagePattern("test-topic")
  public consume(@Payload() payload: any): any {
    console.log(payload);
  }
}