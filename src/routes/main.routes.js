import express from 'express';
import passport from 'passport';
import { current, githubCallback, login, logout, recoverLink, register, restorePassword } from '../controllers/main.controllers.js';

const router = express.Router();

const mainRouter = (store, baseUrl) => {
  router.get('/', (req, res, next) => current(req, res, next, store));
  router.post('/register', passport.authenticate('authRegistration', { failureRedirect: '/register' }), (req, res, next) => register(req, res, next, baseUrl));
  router.post('/login', passport.authenticate('login', { failureRedirect: '/login' }), (req, res, next) => login(req, res, next, baseUrl));
  router.post('/recoverlink', (req, res, next) => recoverLink(req, res, next, baseUrl));
  router.post('/restorepassword', (req, res, next) => restorePassword(req, res, next, baseUrl));
  router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => {});
  router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res, next) => githubCallback(req, res, next, baseUrl));
  router.get('/logout', (req, res, next) => logout(req, res, next, baseUrl));

  return router;
};

export default mainRouter;
