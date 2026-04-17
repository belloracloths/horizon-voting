import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service'; 
import { AdminModule } from './admin/admin.module'; 
import { VoteModule } from './vote/vote.module'; 
import { ResultsGateway } from './results.gateway'; // 

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 
    }),
    AuthModule, 
    AdminModule,
    VoteModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, ResultsGateway], // 
})
export class AppModule {}