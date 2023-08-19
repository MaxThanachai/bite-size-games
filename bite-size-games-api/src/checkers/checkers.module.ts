import { Module } from '@nestjs/common';
import { CheckersController } from './checkers.controller';
// import { CatsController } from './cats.controller';
// import { CatsService } from './cats.service';

@Module({
  controllers: [CheckersController],
  providers: [],
})
export class CheckersModule {}
