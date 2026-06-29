import { Router, Request, Response } from 'express';
import { authMiddleware } from '@shared/middleware/authMiddleware';
import { validationMiddleware } from '@shared/middleware/validationMiddleware';
import { registerSchema, loginSchema } from '@shared/utils/validators';
import { AuthService } from '@apps/auth/services/authService';
import { asyncHandler } from '@shared/middleware/errorHandler';

const router = Router();
const authService = new AuthService();

// Register
router.post(
  '/register',
  validationMiddleware(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, fullName, phone } = req.body;
    const user = await authService.register(email, password, fullName, phone);
    res.status(201).json({
      success: true,
      data: user,
    });
  })
);

// Login
router.post(
  '/login',
  validationMiddleware(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const tokens = await authService.login(email, password);
    res.json({
      success: true,
      data: { tokens },
    });
  })
);

// Refresh Token
router.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    res.json({
      success: true,
      data: tokens,
    });
  })
);

export default router;
