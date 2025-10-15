import * as winston from 'winston';
const { combine, json, timestamp, errors } = winston.format;

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD hh:mm:ss.aSSS A' }),
    json()
  ),
  transports: [new winston.transports.Console()]
});

export default logger;
