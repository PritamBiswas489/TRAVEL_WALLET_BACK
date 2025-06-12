import express from 'express';
const router = express.Router();
import { default as frontRouter } from './front.router.js';


router.use('/front', frontRouter);

export default router;
