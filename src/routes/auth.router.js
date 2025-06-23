import '../config/environment.js';
import express from 'express';
import { default as jwtVerify } from '../middlewares/jwtVerify.js';
import { default as profileRouter } from './profile.router.js';
import { default as depositRouter } from './deposit.router.js';
 
const router = express.Router();

//jwtVerify is a middleware that checks if the user is authenticated
router.use(jwtVerify);


router.use('/profile', profileRouter);
router.use('/deposit', depositRouter);

export default router;
