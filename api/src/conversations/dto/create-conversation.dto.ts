import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateConversationSchema = z.object({
  title: z.string().min(1).max(100),
});

export class CreateConversationDto extends createZodDto(CreateConversationSchema) { } 