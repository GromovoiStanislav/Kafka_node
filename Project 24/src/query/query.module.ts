import { Module } from "@nestjs/common";
import { KafkaConsumer } from "./kafka.consumer";

@Module({
  controllers: [KafkaConsumer]
})
export class QueryModule {
}
