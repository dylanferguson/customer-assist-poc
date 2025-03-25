import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationQueryDto } from './dto/conversation-query.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createConversationDto: CreateConversationDto) {
    return this.conversationsService.createConversation(createConversationDto);
  }

  @Get()
  findAll(@Query() query: ConversationQueryDto) {
    return this.conversationsService.findAll(query);
  }

  @Get(':conversationId')
  findOne(@Param('conversationId') id: string) {
    const conversation = this.conversationsService.findOne(id);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    return conversation;
  }

  @Patch(':conversationId')
  update(
    @Param('conversationId') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    const conversation = this.conversationsService.update(id, updateConversationDto);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    return conversation;
  }

  @Get(':conversationId/messages')
  getMessages(@Param('conversationId') id: string) {
    const conversation = this.conversationsService.findOne(id);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    return this.conversationsService.getMessages(id);
  }

  @Post(':conversationId/messages')
  @HttpCode(HttpStatus.CREATED)
  createMessage(
    @Param('conversationId') id: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const message = this.conversationsService.createMessage(id, createMessageDto);
    if (!message) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    return message;
  }
} 