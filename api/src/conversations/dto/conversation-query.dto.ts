import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ConversationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  is_archived: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val.toLowerCase() === "true") return true;
      if (val.toLowerCase() === "false") return false;
    }
    return val;
  }, z.boolean()).default(false),
});

export class ConversationQueryDto extends createZodDto(ConversationQuerySchema) { } 