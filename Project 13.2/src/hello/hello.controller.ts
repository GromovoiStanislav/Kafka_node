import { Body, Controller, Post } from "@nestjs/common";
import { HelloService } from "./hello.service";


@Controller("hello")
export class HelloController {

  constructor(
    private readonly helloService: HelloService
  ) {
  }

  @Post("send")
  async sendKafkaMessage(@Body() message: { value: string }) {
    return await this.helloService.sendMessage(message.value);
  }
}
