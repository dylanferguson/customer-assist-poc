import { Injectable, Logger } from '@nestjs/common';
import {
  ConnectParticipantClient,
  CreateParticipantConnectionCommand,
  SendMessageCommand,
  DisconnectParticipantCommand,
  CreateParticipantConnectionCommandInput,
  SendMessageCommandInput,
  ConnectionType,
} from '@aws-sdk/client-connectparticipant';

interface ParticipantConnectionConfig {
  participantToken: string;
}

interface SendMessageParams {
  connectionToken: string;
  contentType: string;
  content: string;
}

@Injectable()
export class ConnectParticipantService {
  private readonly logger = new Logger(ConnectParticipantService.name);
  private readonly client: ConnectParticipantClient;

  constructor() {
    this.client = new ConnectParticipantClient({
      region: process.env.AWS_REGION,
    });
  }

  /**
   * Creates a websocket connection for the participant
   * @param config - Configuration for creating participant connection
   * @returns Connection credentials including websocket URL
   */
  async createParticipantConnection(config: ParticipantConnectionConfig) {
    try {
      const input: CreateParticipantConnectionCommandInput = {
        Type: [ConnectionType.WEBSOCKET],
        ParticipantToken: config.participantToken,
      };

      const command = new CreateParticipantConnectionCommand(input);
      const response = await this.client.send(command);

      return response
    } catch (error) {
      this.logger.error('Failed to create participant connection', error);
      throw error;
    }
  }

  /**
   * Sends a message through the participant connection
   * @param params - Parameters for sending the message
   * @returns The response from the send message command
   */
  async sendMessage(params: SendMessageParams) {
    try {
      const input: SendMessageCommandInput = {
        ContentType: params.contentType,
        Content: params.content,
        ConnectionToken: params.connectionToken,
      };

      const command = new SendMessageCommand(input);
      return await this.client.send(command);
    } catch (error) {
      this.logger.error('Failed to send message', error);
      throw error;
    }
  }

  /**
   * Disconnects a participant from the chat
   * @param connectionToken - The connection token to disconnect
   */
  async disconnectParticipant(connectionToken: string) {
    try {
      const command = new DisconnectParticipantCommand({
        ConnectionToken: connectionToken,
      });

      await this.client.send(command);
    } catch (error) {
      this.logger.error('Failed to disconnect participant', error);
      throw error;
    }
  }
} 