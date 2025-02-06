import express from 'express';
import NotificationController from '../controllers/notificationController';
import AuthMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.use(AuthMiddleware.authenticate);
/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management
 */

/**
 * @swagger
 * /user-api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved notifications
 *       500:
 *         description: Internal server error
 */
router.get('/', NotificationController.getUserNotifications);

/**
 * @swagger
 * /user-api/notifications/{notificationId}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: notificationId
 *         in: path
 *         required: true
 *         description: The ID of the notification to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted notification
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:notificationId', NotificationController.deleteNotification);

export default router;