import { logger } from '../middlewares/logger.js';

export default class CustomError extends Error {
  constructor(err, detail, fatal = false) {
    super(err.msg);
    this.statusCode = err.code;
    const levelLogger = fatal ? logger.fatal : logger.error;
    detail && levelLogger(`${new Date().toLocaleTimeString()} - ${err.msg} - ${detail}`);
    this.customError = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
