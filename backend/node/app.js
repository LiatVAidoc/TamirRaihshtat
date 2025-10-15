import express from 'express';
import cors from 'cors';
import router from './route/index.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import config from './configuration/config.js';
import compression from 'compression';
import logger from './logger/logger.js';

const app = express();

app
  .use(cors())
  .use(express.json())
  .use(compression())
  .use(router)
  .use(errorMiddleware);

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});
