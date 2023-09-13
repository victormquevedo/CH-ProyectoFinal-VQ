import { cartsService, productsService, ticketsService, usersService } from '../repositories/_index.js';
import CustomError from '../services/customErrors.js';
import PaymentService from '../services/payments.js';
import { errorsDict } from '../utils/errorsDict.js';

export const createCart = async (req, res, next) => {
  try {
    const response = await cartsService.createCart();
    await usersService.addCartId(req.body.email, response.id);
    res.status(200).send(response);
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const getCartById = async (req, res, next) => {
  try {
    const cart = await cartsService.getCartById(parseInt(req.params.cid));
    res.status(200).json(cart);
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const addProductToCart = async (req, res, next) => {
  try {
    const cid = parseInt(req.params.cid);
    const pid = parseInt(req.params.pid);
    const productOwner = await productsService.getProductById(pid).owner;
    if (req.sessionStore.user.role !== 'user' || req.sessionStore.user.email === productOwner) {
      // No hace falta validar si es premium porque ya fue validado en el middleware de autorización para ver si era user o premium
      throw new CustomError(errorsDict.UNAUTHORIZED);
    } else {
      const response = await cartsService.addProductToCart(cid, pid);
      res.status(200).send(response);
    }
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const deleteProductFromCart = async (req, res, next) => {
  try {
    const response = await cartsService.deleteProductFromCart(parseInt(req.params.cid), parseInt(req.params.pid));
    res.status(200).send(response);
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const updateCart = async (req, res, next) => {
  try {
    const response = await cartsService.updateCart(parseInt(req.params.cid), req.body);
    res.status(200).send(response);
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const updateProductQuantityFromCart = async (req, res, next) => {
  try {
    const response = await cartsService.updateProductQuantityFromCart(parseInt(req.params.cid), parseInt(req.params.pid), req.body);
    res.status(200).send(response);
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const deleteAllProductsFromCart = async (req, res, next) => {
  try {
    const response = await cartsService.deleteAllProductsFromCart(parseInt(req.params.cid));
    res.status(200).send(response);
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const purchase = async (req, res, next, baseUrl) => {
  try {
    const cid = req.params.cid;
    const user = await usersService.getUserByCart(cid);
    const cart = await cartsService.getCartById(cid);
    let unavailableProducts = [];
    let listedProducts = [];

    const amount = await cart.products.reduce(async (accPromise, cv) => {
      const acc = await accPromise;
      const product = await productsService.getProductById(cv.id);

      if (product.stock < cv.quantity) {
        unavailableProducts.push({ ...product, quantity: cv.quantity });
        return acc;
      }

      const newStock = product.stock - cv.quantity;

      await cartsService.deleteProductFromCart(cid, product.id);
      await productsService.updateProduct({ id: product.id, stock: newStock });

      const unitPrice = product.price;
      const totalPrice = cv.quantity * unitPrice;

      listedProducts.push({
        price_data: {
          product_data: {
            name: product.title
          },
          currency: 'usd',
          unit_amount: unitPrice * 100
        },
        quantity: cv.quantity
      });

      return acc + totalPrice;
    }, Promise.resolve(0));

    await ticketsService.createTicket({ amount, purchaser: user.email });

    const data = {
      line_items: listedProducts,
      mode: 'payment',
      success_url: `${baseUrl}/home/checkoutSuccess/${cid}`,
      cancel_url: `${baseUrl}/home/checkoutCancel`
    };

    const service = new PaymentService();
    const payment = await service.createPaymentSession(data);

    res.status(200).send(payment);
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};
