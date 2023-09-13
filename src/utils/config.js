import dotenv from 'dotenv';
import { Command } from 'commander';

const program = new Command();
program
  .version('2.0.1')
  .option('-p --port <port>', 'Execution port', 3000)
  .option('-m --mode <mode>', 'Execution mode (PRODUCTION / DEVELOPMENT)', 'DEVELOPMENT')
  .option('-d --debug', 'Activate / deactivate debug', false)
  .parse(process.argv);
const cl_options = program.opts();

// El entorno de development y de producción es el mismo. Aquí podría tener dos bases de datos distintas.
dotenv.config({ path: cl_options.mode == 'DEVEL' ? './.env.development' : './.env.production' });

const config = {
  MODE: cl_options.mode,
  URL: process.env.URL,
  WS_URL: process.env.WS_URL,
  PORT: process.env.PORT,
  WS_PORT: process.env.WS_PORT,
  MONGOOSE_URL: process.env.MONGOOSE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  PERSISTENCE: process.env.PERSISTENCE,
  ENCRYPT_QUERY_PARAM_KEY: process.env.ENCRYPT_QUERY_PARAM_KEY,
  ENCRYPT_QUERY_INIT_VECTOR: process.env.ENCRYPT_QUERY_INIT_VECTOR,
  STRIPE_KEY: process.env.STRIPE_KEY,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL
};

export default config;
