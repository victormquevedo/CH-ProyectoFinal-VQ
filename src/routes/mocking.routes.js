import express from 'express';
import { mockingProducts } from '../controllers/mocking.controllers.js';

const router = express.Router();

router.get('/mockingProducts', mockingProducts);

export default router;
