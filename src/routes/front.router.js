import '../config/environment.js';
import express from 'express';
import { default as loginRouter } from './login.router.js';
const router = express.Router();
import ContactUsController from '../controllers/contactus.controller.js';




/**
 * @swagger
 * /api/front/contact-us:
 *   post:
 *     summary: Save contact us content
 *     tags: [Non authenticated routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *                 required: true
 *               phoneOne:
 *                 type: string
 *                 required: true
 *               phoneTwo:
 *                 type: string
 *                 required: false
 *               email:
 *                 type: string
 *                 required: true
 *               website:
 *                 type: string
 *                 required: false
 *     responses:
 *       200:
 *         description: Content saved successfully
 */
router.post('/contact-us', async (req, res, next) => {
	const response = await ContactUsController.saveContent({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
   res.return(response);
});
//create swagger  for below router
 /**
    * @swagger
    * /api/front/contact-us:
    *   get:
    *     summary: Get contact us content
    *     tags: [Non authenticated routes]
    *     responses:
    *       200:
    *         description: Contact us endpoint is working
    */
router.get('/contact-us', async (req, res, next) => {
   const response = await ContactUsController.listAll({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
   res.return(response)
});

router.use('/login',loginRouter)

export default router;