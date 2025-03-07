import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateMessageSchema = z.object({
  content: z.string().min(1),
  contentType: z.enum(['plain_text']),
});

export class CreateMessageDto extends createZodDto(CreateMessageSchema) {} 