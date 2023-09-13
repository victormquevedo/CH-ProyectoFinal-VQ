import winston from 'winston';
import config from '../utils/config.js';

const customLevelOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5
  },
  colors: {
    fatal: 'magenta',
    error: 'red',
    warning: 'yellow',
    info: 'cyan',
    http: 'green',
    debug: 'blue'
  }
};

const devLogger = winston.createLogger({
  levels: customLevelOptions.levels,
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(winston.format.colorize({ colors: customLevelOptions.colors }), winston.format.simple())
    })
  ]
});

const prodLogger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(winston.format.colorize({ colors: customLevelOptions.colors }), winston.format.simple())
    }),
    new winston.transports.File({
      level: 'error',
      filename: './src/logs/errors.log'
    })
  ]
});

export const logger = config.MODE === 'DEVELOPMENT' ? devLogger : prodLogger;

export const addLogger = (req, res, next) => {
  req.logger = logger;
  req.logger.debug(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url}`);
  next();
};
