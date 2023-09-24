import { Module } from '@nestjs/common';
import { CheckersController } from './checkers.controller';
import { CheckersLogic } from './checkers.logic';

@Module({
  controllers: [CheckersController],
  providers: [CheckersLogic],
})
export class CheckersModule {}
