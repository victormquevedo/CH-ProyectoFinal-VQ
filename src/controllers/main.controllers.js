import { usersService } from '../repositories/_index.js';
import { sendRecoverEmail } from '../services/emails.js';

export const current = async (req, res, next, store) => {
  try {
    store.get(req.sessionID, async (err, data) => {
      if (err) throw new Error({ message: `Error while trying to retrieve data session (${err})` });
      if (req.session.userValidated || req.sessionStore.userValidated) {
        res.redirect('/home/products');
      } else {
        res.redirect('/login');
      }
    });
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const register = async (req, res, next, baseUrl) => {
  try {
    const { first_name, last_name, age, login_email, login_password, role } = req.body;
    await usersService.addUser({
      firstName: first_name,
      lastName: last_name,
      age,
      email: login_email,
      password: login_password,
      role
    });
    req.session.userValidated = req.sessionStore.userValidated = true;
    req.sessionStore.email = login_email;
    const user = await usersService.getUserByEmail(login_email);
    req.sessionStore.user = user;
    res.redirect(baseUrl);
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const login = async (req, res, next, baseUrl) => {
  try {
    if (!req.user) throw new Error({ message: 'Invalid credentials' });
    req.session.userValidated = req.sessionStore.userValidated = true;
    req.sessionStore.email = req.body.login_email;
    const user = await usersService.getUserByEmail(req.body.login_email);
    req.sessionStore.user = user;
    await usersService.addLastConnectionTimeDateToUser(user.id);
    res.redirect(baseUrl);
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const recoverLink = async (req, res, next, baseUrl) => {
  try {
    const userId = (await usersService.getUserByEmail(req.body.login_email)).id;
    sendRecoverEmail(req.body.login_email, baseUrl, userId);
    res.redirect(baseUrl);
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const restorePassword = async (req, res, next, baseUrl) => {
  try {
    const { restore_email, restore_password } = req.body;
    await usersService.restorePassword({ email: restore_email, password: restore_password });
    res.redirect(baseUrl);
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const githubCallback = async (req, res, next, baseUrl) => {
  try {
    req.session.userValidated = req.sessionStore.userValidated = true;
    req.sessionStore.email = req.user.email;
    const user = await usersService.getUserByEmail(req.user.email);
    req.sessionStore.user = user;
    await usersService.addLastConnectionTimeDateToUser(user.id);
    res.redirect(baseUrl);
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};

export const logout = async (req, res, next, baseUrl) => {
  try {
    req.session.userValidated = req.sessionStore.userValidated = false;
    if (req.sessionStore.user?.id) {
      await usersService.addLastConnectionTimeDateToUser(req.sessionStore.user.id);
    }
    req.session.destroy((err) => {
      req.sessionStore.destroy(req.sessionID, (err) => {
        if (err) throw new Error({ message: `Error while trying to destroy the session (${err})` });
        req.logger.info(`${new Date().toLocaleTimeString()} - Destroyed sesion`);
        res.redirect(baseUrl);
      });
    });
  } catch (err) {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};
