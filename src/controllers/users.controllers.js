import { usersService } from '../repositories/_index.js';
import { __dirname } from '../utils/fileUtils.js';

export const convertUser = async (req, res, next) => {
  try {
    const response = await usersService.convertUser(req.params.uid);
    res.status(200).send(response);
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const uploadDocuments = async (req, res, next) => {
  try {
    const filesUpdatedSuccessfully = [];
    const filesNotUpdated = [];
    for (let file of req.files) {
      const response = await usersService.uploadDocuments({
        uid: req.params.uid,
        name: req.body.name,
        reference: `${__dirname}../public/documents/${file.filename}`
      });
      if (response) {
        filesUpdatedSuccessfully.push(file.originalname);
      } else {
        filesNotUpdated.push(file.originalname);
      }
    }
    res.status(200).json({
      filesUpdatedSuccessfully,
      filesNotUpdated
    });
  } catch (err) {
    req.logger.error(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const response = await usersService.getUsers();
    res.status(200).json(response);
  } catch (err) {
    req.logger.error(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const removeInactiveUsers = async (req, res, next) => {
  try {
    const response = await usersService.removeInactiveUsers(req.params.minutes);
    res.status(200).send(response);
  } catch (err) {
    req.logger.error(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const removeUser = async (req, res, next) => {
  try {
    const response = await usersService.removeUser(req.params.uid);
    res.status(200).send(response);
  } catch (err) {
    req.logger.error(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};
