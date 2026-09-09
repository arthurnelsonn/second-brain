import 'server-only';
import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  PCC_DB_PATH: z.string().optional(),
  PCC_SECRETS_PATH: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`\n❌ Invalid environment variables:\n${missing}\n\nCopy .env.example to .env.local and fill in the required values.\n`);
  }
  return result.data;
}

export const env = validateEnv();
