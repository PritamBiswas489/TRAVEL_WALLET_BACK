import '../config/environment.js';
import express from 'express';
import { default as jwtVerify } from '../middlewares/jwtVerify.js';
import { default as profileRouter } from './profile.router.js';
import { default as depositRouter } from './deposit.router.js';
import { default as walletRouter } from './wallet.router.js';
import trackIpAddressDeviceId from '../middlewares/trackIpAddressDeviceId.js';
import { default as kycRouter } from './kyc.router.js';
import { default as transferRouter } from './transfer.router.js';
import { default as transferRequestRouter } from './transferRequest.router.js';
import { default as encryptionRouter } from './encryption.router.js';
import { default as philippinesPayment } from './philippinesPayment.router.js';
import { default as vietnamPaymentRouter } from './vietnamPayment.router.js';



 
const router = express.Router();

//jwtVerify is a middleware that checks if the user is authenticated
router.use(trackIpAddressDeviceId);
// router.use(jwtVerify);


router.use('/profile', profileRouter);
router.use('/deposit', depositRouter);
router.use('/wallet', walletRouter);
router.use('/kyc', kycRouter);
router.use('/transfer', transferRouter);
router.use('/transfer-request', transferRequestRouter);
router.use('/crypto', encryptionRouter);
router.use('/pisopay', philippinesPayment);
router.use('/ninepay', vietnamPaymentRouter);

export default router;
