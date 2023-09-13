import { ObjectId } from 'mongodb';
import ticketsModel from './../../models/tickets.model.js';
import CustomError from '../../services/customErrors.js';
import { errorsDict } from '../../utils/errorsDict.js';

class TicketsManager {
  constructor() {
    this.ticket = [];
  }

  createTicket = async ({ amount, purchaser }) => {
    try {
      await ticketsModel.create({
        code: new ObjectId(),
        purchase_datetime: new Date(),
        amount,
        purchaser
      });
      return { message: 'Ticket created successfully' };
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `createTicket - ${err}`, true);
    }
  };
}

export default TicketsManager;
