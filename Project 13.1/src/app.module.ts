import { Module } from "@nestjs/common";
import { KafkaModule } from "./kafka/kafka.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    KafkaModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {
}
