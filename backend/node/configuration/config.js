import * as process from 'node:process';
import { config as dotenvConfig } from 'dotenv';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import logger from '../logger/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || 'development';
dotenvConfig({ path: path.resolve(__dirname, `../../.env.${env}`) });
const configSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production']).default('development')
});

const parsedConfig = configSchema.safeParse(process.env);
if (!parsedConfig.success) {
  logger.error(z.treeifyError(parsedConfig.error));
}
const { data } = parsedConfig;
const config = {
  port: data.PORT,
  node_env: data.NODE_ENV,
};
export default config;
