import express from 'express';
import { addProduct, deleteProduct, getProductById, getProducts, updateProduct } from '../controllers/products.controllers.js';
import { apiValidate } from '../middlewares/validation.js';
import { adminAndPremiumAuthorization } from '../middlewares/authorization.js';

const router = express.Router();

const productsRouter = (wss) => {
  router.get('/', apiValidate, getProducts);
  router.get('/:pid', apiValidate, getProductById);
  router.post('/', apiValidate, adminAndPremiumAuthorization, (req, res, next) => addProduct(req, res, next, wss));
  router.put('/:pid', apiValidate, adminAndPremiumAuthorization, updateProduct);
  router.delete('/:pid', apiValidate, adminAndPremiumAuthorization, (req, res, next) => deleteProduct(req, res, next, wss));

  return router;
};

export default productsRouter;
