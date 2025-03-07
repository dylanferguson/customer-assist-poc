import { z } from 'zod';

const envSchema = z.object({
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_CONNECT_INSTANCE_ID: z.string().min(1),
  AWS_CONNECT_CONTACT_FLOW_ID: z.string().min(1),
});

export function validate(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);
  
  if (!result.success) {
    throw new Error(`Environment validation error: ${result.error.toString()}`);
  }
  
  return result.data;
}

// Export type for use in the app
export type Env = z.infer<typeof envSchema>; 