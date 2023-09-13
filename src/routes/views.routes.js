import express from 'express';
import { renderValidate } from '../middlewares/validation.js';
import { carts, login, messages, userRecovery, passwordRestore, products, realTimeProducts, register, users, checkoutSuccess, checkoutCancel } from '../controllers/views.controllers.js';
import { adminAuthorization } from '../middlewares/authorization.js';

const router = express.Router();

const mainRouter = (BASE_URL, WS_URL) => {
  router.get('/login', (req, res) => login(req, res, BASE_URL));
  router.get('/register', register);
  router.get('/userrecovery', (req, res) => userRecovery(req, res, BASE_URL));
  router.get('/passwordrestore', (req, res) => passwordRestore(req, res, BASE_URL));
  router.get('/home/products', renderValidate, (req, res) => products(req, res, BASE_URL, WS_URL));
  router.get('/home/realTimeProducts', renderValidate, (req, res) => realTimeProducts(req, res, WS_URL));
  router.get('/home/messages', renderValidate, (req, res) => messages(req, res, BASE_URL, WS_URL));
  router.get('/home/carts/:cid', renderValidate, (req, res) => carts(req, res, BASE_URL));
  router.get('/home/users', renderValidate, adminAuthorization, (req, res) => users(req, res, BASE_URL));
  router.get('/home/checkoutSuccess/:cid', renderValidate, (req, res) => checkoutSuccess(req, res, BASE_URL));
  router.get('/home/checkoutCancel', renderValidate, (req, res) => checkoutCancel(req, res, BASE_URL));

  return router;
};

export default mainRouter;
