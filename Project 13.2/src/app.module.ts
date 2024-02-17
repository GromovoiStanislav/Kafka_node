import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka/kafka.module';
import { ConfigModule } from "@nestjs/config";
import { HelloModule } from './hello/hello.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    //KafkaModule,
    HelloModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
