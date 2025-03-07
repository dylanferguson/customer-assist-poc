import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { AmazonConnectService } from './amazon-connect.service';

@Module({
  controllers: [ConversationsController],
  providers: [ConversationsService, AmazonConnectService],
  exports: [ConversationsService],
})
export class ConversationsModule {} 