import { logger } from '../middlewares/logger.js';
import config from './../utils/config.js';
import mongoose from 'mongoose';

export default class MongoSingleton {
  static #instance;

  constructor() {
    mongoose.connect(config.MONGOOSE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  }

  static getInstance() {
    if (!this.#instance) {
      this.#instance = new MongoSingleton();
      logger.info(`${new Date().toLocaleTimeString()} - DB conection CREATED`);
    } else {
      logger.info(`${new Date().toLocaleTimeString()} - DB conection RETRIEVED`);
    }

    return this.#instance;
  }
}
