import { productsService, usersService } from '../repositories/_index.js';
import CustomError from '../services/customErrors.js';
import { sendRemovedProductEmail } from '../services/emails.js';
import { errorsDict } from '../utils/errorsDict.js';

export const getProducts = async (req, res, next) => {
  try {
    const products = await productsService.getProducts(req.query);
    res.status(200).json(products);
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await productsService.getProductById(parseInt(req.params.pid));
    res.status(200).json(product);
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const addProduct = async (req, res, next, wss) => {
  try {
    const newProduct = req.body;
    const response = await productsService.addProduct(newProduct);
    const newId = response.id;
    res.status(200).send(response);
    wss.emit('new_product', { response, newProduct, newId });
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.pid);
    const productOwner = await productsService.getProductById(id).owner;
    if (req.sessionStore.user.role !== 'admin' && req.sessionStore.user.email !== productOwner) {
      // No hace falta validar si es premium porque ya fue validado en el middleware de autorización para ver si era admin o premium
      throw new CustomError(errorsDict.UNAUTHORIZED);
    } else {
      const response = await productsService.updateProduct({
        id,
        ...req.body
      });
      res.status(200).send(response);
    }
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const deleteProduct = async (req, res, next, wss) => {
  try {
    const id = parseInt(req.params.pid);
    const product = await productsService.getProductById(id);
    if (req.sessionStore.user.role !== 'admin' && req.sessionStore.user.email !== product.owner) {
      // No hace falta validar si es premium porque ya fue validado en el middleware de autorización para ver si era admin o premium
      throw new CustomError(errorsDict.UNAUTHORIZED);
    } else {
      const response = await productsService.deleteProduct(id);
      const ownerRole = (await usersService.getUserByEmail(product.owner)).role;
      if (ownerRole === 'premium') {
        sendRemovedProductEmail(product);
      }
      wss.emit('deleted_product', { response, id });
      res.status(200).send(response);
    }
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};
