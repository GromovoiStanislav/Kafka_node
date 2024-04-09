import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from "@nestjs/config";
import { CmdModule } from './cmd/cmd.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, }),
    CmdModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
