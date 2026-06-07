import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as chatController from '../controllers/chat.controller';

const router = Router();

router.get('/status', chatController.getChatStatus);
router.post('/', authenticate, chatController.getOrCreateChat);
router.get('/', authenticate, chatController.getMyChats);
router.get('/staff', authenticate, authorize('admin', 'staff', 'superadmin'), chatController.getStaffList);
router.put('/admin-status', authenticate, authorize('admin', 'superadmin'), chatController.updateAdminOnlineStatus);
router.get('/:chatId/messages', authenticate, chatController.getChatMessages);
router.post('/:chatId/messages', authenticate, chatController.sendMessage);
router.put('/:chatId/close', authenticate, chatController.closeChat);
router.put('/:chatId/assign', authenticate, authorize('admin', 'staff', 'superadmin'), chatController.assignChat);

export default router;
