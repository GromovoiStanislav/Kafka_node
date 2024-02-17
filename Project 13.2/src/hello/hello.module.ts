import { Module } from "@nestjs/common";
import { HelloService } from "./hello.service";
import { HelloController } from "./hello.controller";
import { KafkaModule } from "../kafka/kafka.module";

@Module({
  imports: [KafkaModule],
  providers: [HelloService],
  controllers: [HelloController]
})
export class HelloModule {
}
