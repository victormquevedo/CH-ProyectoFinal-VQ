import CustomError from '../services/customErrors.js';
import { errorsDict } from '../utils/errorsDict.js';

const PREMIUM = 'premium';
const ADMIN = 'admin';
const USER = 'user';

export const adminAuthorization = async (req, res, next) => {
  try {
    if (req.sessionStore.user?.role === ADMIN) {
      next();
    } else {
      throw new CustomError(errorsDict.UNAUTHORIZED);
    }
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${err.message}`);
    next(err);
  }
};

export const adminAndPremiumAuthorization = async (req, res, next) => {
  try {
    if (req.sessionStore.user?.role === PREMIUM || req.sessionStore.user.role === ADMIN) {
      next();
    } else {
      throw new CustomError(errorsDict.UNAUTHORIZED);
    }
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${err.message}`);
    next(err);
  }
};

export const premiumAuthorization = async (req, res, next) => {
  try {
    if (req.sessionStore.user?.role === PREMIUM) {
      next();
    } else {
      throw new CustomError(errorsDict.UNAUTHORIZED);
    }
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${err.message}`);
    next(err);
  }
};

export const userAuthorization = async (req, res, next) => {
  try {
    if (req.sessionStore.user?.role === USER) {
      next();
    } else {
      throw new CustomError(errorsDict.UNAUTHORIZED);
    }
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${err.message}`);
    next(err);
  }
};

export const userAndPremiumAuthorization = async (req, res, next) => {
  try {
    if (req.sessionStore.user?.role === USER || req.sessionStore.user?.role === PREMIUM) {
      next();
    } else {
      throw new CustomError(errorsDict.UNAUTHORIZED);
    }
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${err.message}`);
    next(err);
  }
};
