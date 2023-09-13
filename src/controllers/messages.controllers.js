import { messagesService } from '../repositories/_index.js';

export const getMessages = async (req, res, next) => {
  try {
    const messagesHistory = await messagesService.getMessages();
    res.status(200).send(JSON.stringify(messagesHistory));
  } catch (err) {
    req.logger.error(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const addMessage = async (req, res, next, wss) => {
  try {
    const newMessage = req.body;
    const response = await messagesService.addMessage(newMessage);
    wss.emit('message_received', newMessage);
    res.status(200).send(response);
  } catch (err) {
    req.logger.error(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};
