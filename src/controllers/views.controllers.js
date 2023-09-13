import { cartsService, productsService, messagesService, usersService } from '../repositories/_index.js';
import PaymentService from '../services/payments.js';
import { decryptQueryParam } from '../services/queryParamsEncryption.js';

export const login = async (req, res, BASE_URL) => {
  res.render('login', {
    baseUrl: BASE_URL
  });
};

export const register = async (req, res) => {
  res.render('register');
};

export const userRecovery = async (req, res, BASE_URL) => {
  res.render('userrecovery', {
    baseUrl: BASE_URL
  });
};

export const passwordRestore = async (req, res, BASE_URL) => {
  const userId = decryptQueryParam(req.query.uid);
  const expirationTime = decryptQueryParam(req.query.et);
  const user = await usersService.getUserById(userId);
  res.render('passwordrestore', {
    baseUrl: BASE_URL,
    userEmail: user.email,
    isExpirated: new Date().getTime() > Number(expirationTime)
  });
};

export const products = async (req, res, BASE_URL, WS_URL) => {
  const products = await productsService.getProducts(req.query);
  res.render('products', {
    products,
    baseUrl: BASE_URL,
    wsUrl: WS_URL,
    user: req.sessionStore.user
  });
};

export const realTimeProducts = async (req, res, WS_URL) => {
  const products = await productsService.getProducts(req.query);
  res.render('realTimeProducts', {
    products,
    wsUrl: WS_URL
  });
};

export const messages = async (req, res, BASE_URL, WS_URL) => {
  const messages = await messagesService.getMessages();
  res.render('messages', {
    messages,
    baseUrl: BASE_URL,
    wsUrl: WS_URL
  });
};

export const carts = async (req, res, BASE_URL) => {
  const cart = await cartsService.getCartById(req.params.cid);
  res.render('cart', {
    cart: cart.products.map((product) => {
      const matchedProduct = cart.productsInCart.find((p) => p.id === product.id);
      return { ...product, ...matchedProduct };
    }),
    cartId: req.params.cid,
    baseUrl: BASE_URL
  });
};

export const users = async (req, res, BASE_URL) => {
  const users = await usersService.getUsers();
  res.render('users', { baseUrl: BASE_URL, users });
};

export const checkoutSuccess = async (req, res, BASE_URL) => {
  const cart = await cartsService.getCartById(req.params.cid);
  res.render('checkoutSuccess', {
    productsLeftInCart: cart.products.map((product) => {
      const matchedProduct = cart.productsInCart.find((p) => p.id === product.id);
      return { ...product, ...matchedProduct };
    }),
    baseUrl: BASE_URL
  });
};

export const checkoutCancel = async (req, res, BASE_URL) => {
  res.render('checkoutCancel', {
    baseUrl: BASE_URL
  });
};
