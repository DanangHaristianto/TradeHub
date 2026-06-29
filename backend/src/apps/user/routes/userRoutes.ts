import { Router, Request, Response } from 'express';
import { authMiddleware } from '@shared/middleware/authMiddleware';
import { UserService } from '@apps/user/services/userService';
import { asyncHandler } from '@shared/middleware/errorHandler';

const router = Router();
const userService = new UserService();

// Get profile
router.get(
  '/profile',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUserById(req.user!.id);
    res.json({
      success: true,
      data: user,
    });
  })
);

// Update profile
router.put(
  '/profile',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { fullName, phone } = req.body;
    const user = await userService.updateProfile(req.user!.id, fullName, phone);
    res.json({
      success: true,
      data: user,
    });
  })
);

// Change password
router.post(
  '/password',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    await userService.changePassword(req.user!.id, oldPassword, newPassword);
    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  })
);

export default router;
