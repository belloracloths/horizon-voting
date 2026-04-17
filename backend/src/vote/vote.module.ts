// backend/src/vote/vote.module.ts
import { Module } from '@nestjs/common';
import { VoteController } from './vote.controller';
import { VoteService } from './vote.service';
import { PrismaService } from '../prisma.service'; 
import { ResultsGateway } from '../results.gateway'; 

@Module({
  controllers: [VoteController],
  providers: [VoteService, PrismaService, ResultsGateway], 
})
export class VoteModule {}