import express from 'express';
import { loggerTest } from '../controllers/loggerTest.controllers.js';

const router = express.Router();

router.get('/', loggerTest);

export default router;
