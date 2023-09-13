import { generateProducts } from '../utils/mocking.js';

export const mockingProducts = async (req, res, next) => {
  try {
    res.status(200).send(generateProducts(100));
  } catch (err) {
    next(err);
  }
};
