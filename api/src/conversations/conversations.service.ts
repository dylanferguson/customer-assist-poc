import { Injectable, Logger } from '@nestjs/common';
import { Conversation, ConversationStatus } from './entities/conversation.entity';
import { Message, ParticipantRole } from './entities/message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationQueryDto } from './dto/conversation-query.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { v4 as uuidv4 } from 'uuid';
import { AmazonConnectService } from './amazon-connect.service';
import { ConnectParticipantService } from './connect-participant.service';
import { ConnectWebsocketService } from './connect-websocket.service';
import { ConversationsGateway } from './conversations.gateway';
import { ConnectMessage, EVENT_CONTENT_TYPE } from './schemas/connect-message.schema';
import { TypingEvent } from './entities/websocket.entity';
import { RedactionService } from '../common/services/redaction.service';

@Injectable()
export class ConversationsService {
  private conversations: Conversation[] = [];
  private messages: Record<string, Message[]> = {};
  private connectSessions: Record<string, { participantToken: string, connectionToken: string }> = {};
  private logger = new Logger(ConversationsService.name);

  constructor(
    private readonly amazonConnectService: AmazonConnectService,
    private readonly connectParticipantService: ConnectParticipantService,
    private readonly connectWebsocketService: ConnectWebsocketService,
    private readonly conversationsGateway: ConversationsGateway,
    private readonly redactionService: RedactionService,
  ) {
  }

  async createConversation(createConversationDto: CreateConversationDto): Promise<Conversation> {
    const now = new Date();

    const conversation: Conversation = {
      id: `conv_${uuidv4()}`,
      title: createConversationDto.title,
      status: ConversationStatus.OPEN,
      user_id: '1',
      createdAt: now,
      updatedAt: now,
      unread_count: 0,
      closedAt: null,
      archived: false,
      archivedAt: null,
    };

    const connectSession = await this.amazonConnectService.startChat({
      customerDisplayName: 'Customer',
      attributes: {
        customerId: '1',
      }
    });

    const participantConnection = await this.connectParticipantService.createParticipantConnection({
      participantToken: connectSession.ParticipantToken,
    });

    this.conversations.push(conversation);
    this.messages[conversation.id] = [];
    this.connectSessions[conversation.id] = {
      participantToken: connectSession.ParticipantToken,
      connectionToken: participantConnection?.ConnectionCredentials?.ConnectionToken
    };

    if (participantConnection.Websocket.Url) {
      await this.connectWebsocketService.createWebsocketConnection(
        conversation.id,
        participantConnection.Websocket.Url,
        (connectMessage) => {
          this.handleConnectMessage({ conversationId: conversation.id, connectMessage, userId: '1' });
        }
      );
      this.logger.log(`Websocket connection established for conversation ${conversation.id}`);
    }

    return conversation;
  }

  findAll(query: ConversationQueryDto) {
    let filteredConversations = [...this.conversations];

    filteredConversations = filteredConversations.filter(
      (conv) => conv.archived === query.is_archived,
    );

    if (query.cursor) {
      const cursorIndex = filteredConversations.findIndex(
        (conv) => conv.id === query.cursor,
      );
      if (cursorIndex !== -1) {
        filteredConversations = filteredConversations.slice(cursorIndex + 1);
      }
    }

    filteredConversations.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return query.order === 'asc' ? dateA - dateB : dateB - dateA;
    });

    filteredConversations = filteredConversations.slice(0, query.limit);

    const conversationsWithLastMessage = filteredConversations.map((conv) => {
      const messages = this.messages[conv.id] || [];
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      return {
        ...conv,
        lastMessage,
      };
    });

    const lastConversation = filteredConversations[filteredConversations.length - 1];
    const nextCursor = lastConversation ? lastConversation.id : null;

    return {
      conversations: conversationsWithLastMessage,
      _links: {
        next: nextCursor
          ? { href: `/conversations?cursor=${nextCursor}&limit=${query.limit}` }
          : null,
      },
    };
  }

  findOne(id: string): Conversation {
    return this.conversations.find((conv) => conv.id === id);
  }

  update(id: string, updateConversationDto: UpdateConversationDto): Conversation {
    const conversation = this.findOne(id);
    if (!conversation) return null;

    const now = new Date();

    if (updateConversationDto.status !== undefined) {
      conversation.status = updateConversationDto.status;
      if (updateConversationDto.status === ConversationStatus.CLOSED) {
        conversation.closedAt = now;
      }
    }

    if (updateConversationDto.archived !== undefined) {
      conversation.archived = updateConversationDto.archived;
      if (updateConversationDto.archived) {
        conversation.archivedAt = now;
      } else {
        conversation.archivedAt = null;
      }
    }

    if (updateConversationDto.subject !== undefined) {
      conversation.title = updateConversationDto.subject;
    }

    conversation.updatedAt = now;
    return conversation;
  }

  getMessages(conversationId: string) {
    const messages = this.messages[conversationId] || [];

    return {
      data: messages,
      _links: {
        next: messages.length > 0
          ? { href: `/conversations/${conversationId}/messages?cursor=${messages[messages.length - 1].id}` }
          : null,
      },
    };
  }

  async createMessage(conversationId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    const conversation = this.findOne(conversationId);
    if (!conversation) return null;

    const redactedContent = this.redactionService.redactText(createMessageDto.content);
    const message: Message = {
      conversationId: conversationId,
      id: `msg_${uuidv4()}`,
      content: redactedContent,
      contentType: 'plain_text',
      createdAt: new Date(),
      participantRole: ParticipantRole.CUSTOMER,
      participantName: 'Customer',
    };

    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }

    try {
      const session = this.connectSessions[conversationId];

      if (!session) {
        throw new Error(`No Connect session found for conversation ${conversationId}`);
      }

      await this.connectParticipantService.sendMessage({
        connectionToken: session.connectionToken,
        content: redactedContent,
        contentType: 'text/plain',
      });

      this.messages[conversationId].push(message);

      conversation.updatedAt = new Date();
      conversation.unread_count += 1;

      this.logger.log(`Message sent to Amazon Connect for conversation ${conversationId}`);
    } catch (error) {
      this.logger.error(`Failed to send message to Amazon Connect: ${error.message}`, error.stack);
    }

    return message;
  }

  private handleConnectMessage(payload: {
    conversationId: string,
    connectMessage: ConnectMessage,
    userId: string
  }): void {
    const { conversationId, connectMessage, userId } = payload;
    const message = connectMessage.content;
    const isAgentTypingEvent = message.Type === 'EVENT' && message.ParticipantRole === 'AGENT' && message.ContentType === EVENT_CONTENT_TYPE.TYPING;
    const isNonCustomerMessage = message.Type === 'MESSAGE' && message.ParticipantRole !== 'CUSTOMER';

    if (isAgentTypingEvent) {
      const typingEvent: TypingEvent = {
        conversationId,
        participantType: message.ParticipantRole as 'CUSTOMER' | 'AGENT' | 'CUSTOM_BOT',
        participantName: message.ParticipantId,
      };

      this.conversationsGateway.sendMessageToUser(userId, { type: 'typing', data: typingEvent });
      return;
    }

    if (isNonCustomerMessage) {
      const internalMessage: Message = {
        conversationId,
        id: `msg_${uuidv4()}`,
        content: message.Content,
        contentType: message.ContentType,
        createdAt: new Date(connectMessage.content.AbsoluteTime),
        participantRole: message.ParticipantRole as ParticipantRole,
        participantName: message.ParticipantRole === 'AGENT' ? 'Agent' : 'Virtual Assistant',
      };

      if (!this.messages[conversationId]) {
        this.messages[conversationId] = [];
      }
      this.messages[conversationId].push(internalMessage);

      const conversation = this.findOne(conversationId);
      if (conversation) {
        conversation.updatedAt = new Date();
        conversation.unread_count += 1;
      }

      this.conversationsGateway.sendMessageToUser(userId, { type: 'message', data: internalMessage });
    }

    this.logger.log(`Processed incoming Connect message for conversation ${conversationId}`);
  }
} 