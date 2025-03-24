import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { AmazonConnectService } from './amazon-connect.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [ConversationsController],
  providers: [ConversationsService, AmazonConnectService],
  exports: [ConversationsService],
  imports: [
    ConfigModule,
  ],
})
export class ConversationsModule {} 