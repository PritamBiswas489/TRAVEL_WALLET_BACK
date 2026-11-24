import express from 'express';
import { resolve as pathResolve, dirname, join as pathJoin } from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const currentDir = dirname(fileURLToPath(import.meta.url));
const publicDir = pathResolve(currentDir, '../public');

/**
 * @swagger
 * /beneficiary-form/local:
 *   get:
 *     summary: Get beneficiary form for LOCAL transfer
 *     tags: [Public Forms]
 *     responses:
 *       200:
 *         description: Beneficiary form HTML
 */
router.get('/beneficiary-form/local', (req, res) => {
  res.sendFile(pathResolve(pathJoin(publicDir, 'beneficiary-form-dynamic.html')), {
    headers: {
      'x-transfer-method': 'LOCAL',
    },
  });
});

/**
 * @swagger
 * /beneficiary-form/swift:
 *   get:
 *     summary: Get beneficiary form for SWIFT transfer
 *     tags: [Public Forms]
 *     responses:
 *       200:
 *         description: Beneficiary form HTML
 */
router.get('/beneficiary-form/swift', (req, res) => {
  res.sendFile(pathResolve(pathJoin(publicDir, 'beneficiary-form-dynamic.html')), {
    headers: {
      'x-transfer-method': 'SWIFT',
    },
  });
});

/**
 * @swagger
 * /beneficiary-form:
 *   get:
 *     summary: Get beneficiary form (dynamic based on method query parameter)
 *     tags: [Public Forms]
 *     parameters:
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [LOCAL, SWIFT]
 *         default: LOCAL
 *         description: Transfer method type
 *     responses:
 *       200:
 *         description: Beneficiary form HTML
 */
router.get('/beneficiary-form', (req, res) => {
  res.sendFile(pathResolve(pathJoin(publicDir, 'beneficiary-form-dynamic.html')));
});

export default router;
