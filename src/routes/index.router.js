import express from 'express';
const router = express.Router();
import { default as frontRouter } from './front.router.js';
import { default as authRouter } from './auth.router.js';
import { default as currencyRouter } from './currency.router.js';


router.use('/front', frontRouter);
router.use('/auth', authRouter);
router.use('/currency', currencyRouter);

export default router;
