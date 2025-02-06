import express from 'express';
import AuthMiddleware from '../middlewares/authMiddleware';
import AlertController from '../controllers/alertController';

/**
 * @swagger
 * tags:
 *   name: Alerts
 *   description: Alert management
*/
const router = express.Router();

router.use(AuthMiddleware.authenticate);
/**
 * @swagger
 * /user-api/alerts:
 *   get:
 *     summary: Get user alerts
 *     tags: [Alerts]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved alerts
 *       400:
 *         description: User ID is required
 *       500:
 *         description: Internal server error
 */
router.get('/', AlertController.getUserAlerts);

/**
 * @swagger
 * /user-api/alerts:
 *   post:
 *     summary: Create an alert
 *     tags: [Alerts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assetIdBase:
 *                 type: string
 *               assetIdQuote:
 *                 type: string
 *               targetPrice:
 *                 type: number
 *     responses:
 *       201:
 *         description: Alert created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/', AlertController.createAlert);

/**
 * @swagger
 * /user-api/alerts/{alertId}:
 *   delete:
 *     summary: Delete an alert
 *     tags: [Alerts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         description: The allert ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert deleted successfully
 *       400:
 *         description: Missing required parameters
 *       404:
 *         description: Alert not found
 *       500:
 *         description: Internal server error
 */

router.delete('/:alertId', AlertController.deleteAlert);

export default router;