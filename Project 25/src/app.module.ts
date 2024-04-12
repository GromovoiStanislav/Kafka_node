import { Module } from "@nestjs/common";
import { HttpModule } from "@infra/http/http.module";
import { DatabaseModule } from "@infra/database/database.module";
import { MessagingModule } from "@infra/messaging/kafka/messaging.module";
import { ConfigModule } from "@nestjs/config";


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule, DatabaseModule, MessagingModule
  ]
})
export class AppModule {
}
