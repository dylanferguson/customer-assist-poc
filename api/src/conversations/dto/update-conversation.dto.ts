import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ConversationStatus } from '../entities/conversation.entity';

const UpdateConversationSchema = z.object({
  status: z.nativeEnum(ConversationStatus).optional(),
  archived: z.boolean().optional(),
  subject: z.string().min(1).max(100).optional(),
});

export class UpdateConversationDto extends createZodDto(UpdateConversationSchema) {} 