import express from 'express';
import { addProductToCart, createCart, deleteAllProductsFromCart, deleteProductFromCart, getCartById, updateCart, updateProductQuantityFromCart, purchase } from '../controllers/carts.controllers.js';
import { apiValidate } from '../middlewares/validation.js';
import { userAndPremiumAuthorization } from '../middlewares/authorization.js';

const router = express.Router();

const cartsRouter = (baseUrl) => {
  router.post('/', apiValidate, createCart);
  router.get('/:cid', apiValidate, getCartById);
  router.post('/:cid/products/:pid', apiValidate, userAndPremiumAuthorization, addProductToCart);
  router.delete('/:cid/products/:pid', apiValidate, deleteProductFromCart);
  router.put('/:cid', apiValidate, updateCart);
  router.put('/:cid/products/:pid', apiValidate, updateProductQuantityFromCart);
  router.delete('/:cid', apiValidate, deleteAllProductsFromCart);
  router.post('/:cid/purchase', (req, res, next) => purchase(req, res, next, baseUrl));

  return router;
};

export default cartsRouter;
