import CustomError from '../services/customErrors.js';
import { errorsDict } from '../utils/errorsDict.js';

export const renderValidate = async (req, res, next) => {
  if (req.session.userValidated) {
    next();
  } else {
    res.redirect('/login');
  }
};

export const apiValidate = async (req, res, next) => {
  try {
    if (req.session.userValidated) {
      next();
    } else {
      throw new CustomError(errorsDict.INVALID_CREDENTIALS);
    }
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${err.message}`);
    next(err);
  }
};
