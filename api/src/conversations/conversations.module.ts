import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { AmazonConnectService } from './amazon-connect.service';
import { ConfigModule } from '@nestjs/config';
import { ConnectParticipantService } from './connect-participant.service';
import { ConnectWebsocketService } from './connect-websocket.service';
import { ConversationsGateway } from './conversations.gateway';

@Module({
  controllers: [ConversationsController],
  providers: [
    ConversationsService,
    AmazonConnectService,
    ConnectParticipantService,
    ConnectWebsocketService,
    ConversationsGateway
  ],
  exports: [ConversationsService],
  imports: [
    ConfigModule,
  ],
})
export class ConversationsModule { } 