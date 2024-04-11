import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from "@nestjs/config";
import { CmdModule } from './cmd/cmd.module';
import { QueryModule } from './query/query.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, }),
    CmdModule,
    QueryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
