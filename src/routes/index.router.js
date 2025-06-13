import express from 'express';
const router = express.Router();
import { default as frontRouter } from './front.router.js';
import { default as authRouter } from './auth.router.js';


router.use('/front', frontRouter);
router.use('/auth', authRouter);

export default router;
