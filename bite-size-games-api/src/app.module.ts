import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CheckersModule } from './checkers/checkers.module';

@Module({
  imports: [CheckersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
