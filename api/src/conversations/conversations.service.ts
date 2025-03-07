import { Injectable } from '@nestjs/common';
import { Conversation, ConversationStatus } from './entities/conversation.entity';
import { Message, ParticipantRole } from './entities/message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationQueryDto } from './dto/conversation-query.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { v4 as uuidv4 } from 'uuid';
import { AmazonConnectService } from './amazon-connect.service';

@Injectable()
export class ConversationsService {
  private conversations: Conversation[] = [];
  private messages: Record<string, Message[]> = {};

  constructor(
    private readonly amazonConnectService: AmazonConnectService,
  ) { }

  createConversation(createConversationDto: CreateConversationDto): Conversation {
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

    this.conversations.push(conversation);
    this.messages[conversation.id] = [];
    return conversation;
  }

  findAll(query: ConversationQueryDto) {
    let filteredConversations = [...this.conversations];

    // Filter by archived status
    filteredConversations = filteredConversations.filter(
      (conv) => conv.archived === query.is_archived,
    );

    // Apply cursor-based pagination
    if (query.cursor) {
      const cursorIndex = filteredConversations.findIndex(
        (conv) => conv.id === query.cursor,
      );
      if (cursorIndex !== -1) {
        filteredConversations = filteredConversations.slice(cursorIndex + 1);
      }
    }

    // Apply sorting
    filteredConversations.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return query.order === 'asc' ? dateA - dateB : dateB - dateA;
    });

    // Apply limit
    filteredConversations = filteredConversations.slice(0, query.limit);

    // Format response with last message
    const conversationsWithLastMessage = filteredConversations.map((conv) => {
      const messages = this.messages[conv.id] || [];
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      return {
        ...conv,
        lastMessage,
      };
    });

    // Create pagination links
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

  createMessage(conversationId: string, createMessageDto: CreateMessageDto): Message {
    const conversation = this.findOne(conversationId);
    if (!conversation) return null;

    const message: Message = {
      id: `msg_${uuidv4()}`,
      content: createMessageDto.content,
      contentType: 'plain_text',
      createdAt: new Date(),
      participantRole: ParticipantRole.CUSTOMER,
      participantName: 'Customer',
    };

    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }

    this.messages[conversationId].push(message);

    // Update conversation
    conversation.updatedAt = new Date();
    conversation.unread_count += 1;

    return message;
  }
} 