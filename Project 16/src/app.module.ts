import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { KafkaModule } from "src/kafka/kafka.module";
import { EmployeeModule } from "src/employee/employee.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    KafkaModule,
    EmployeeModule
  ]
})
export class AppModule {
}