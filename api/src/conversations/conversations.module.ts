import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { AmazonConnectService } from './amazon-connect.service';
import { ConfigModule } from '@nestjs/config';
import { ConnectParticipantService } from './connect-participant.service';

@Module({
  controllers: [ConversationsController],
  providers: [ConversationsService, AmazonConnectService, ConnectParticipantService],
  exports: [ConversationsService],
  imports: [
    ConfigModule,
  ],
})
export class ConversationsModule { } 