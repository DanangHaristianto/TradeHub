import { Router, Request, Response } from 'express';
import { authMiddleware } from '@shared/middleware/authMiddleware';
import { asyncHandler } from '@shared/middleware/errorHandler';
import { AppDataSource } from '@config/database';
import { generateId } from '@shared/utils/helpers';

const router = Router();

// Get all alerts
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const alertRepository = AppDataSource.getRepository('Alert');
    const alerts = await alertRepository.find({
      where: { userId: req.user!.id },
      order: { createdAt: 'DESC' },
    });
    res.json({
      success: true,
      data: alerts,
    });
  })
);

// Create alert
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { symbol, alertType, triggerPrice, condition, notificationType } = req.body;
    const alertRepository = AppDataSource.getRepository('Alert');
    const alert = alertRepository.create({
      id: generateId(),
      userId: req.user!.id,
      symbol,
      alertType,
      triggerPrice,
      condition,
      notificationType,
      status: 'PENDING',
      isActive: true,
    });
    await alertRepository.save(alert);
    res.status(201).json({
      success: true,
      data: alert,
    });
  })
);

// Update alert
router.put(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { symbol, alertType, triggerPrice, isActive } = req.body;
    const alertRepository = AppDataSource.getRepository('Alert');
    const alert = await alertRepository.findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!alert) {
      return res.status(404).json({ success: false, error: { message: 'Alert not found' } });
    }
    alert.symbol = symbol || alert.symbol;
    alert.alertType = alertType || alert.alertType;
    alert.triggerPrice = triggerPrice || alert.triggerPrice;
    alert.isActive = isActive !== undefined ? isActive : alert.isActive;
    await alertRepository.save(alert);
    res.json({
      success: true,
      data: alert,
    });
  })
);

// Delete alert
router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const alertRepository = AppDataSource.getRepository('Alert');
    await alertRepository.delete({
      id: req.params.id,
      userId: req.user!.id,
    });
    res.json({
      success: true,
      message: 'Alert deleted',
    });
  })
);

// Get active alerts
router.get(
  '/active',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const alertRepository = AppDataSource.getRepository('Alert');
    const alerts = await alertRepository.find({
      where: { userId: req.user!.id, isActive: true, status: 'PENDING' },
    });
    res.json({
      success: true,
      data: alerts,
    });
  })
);

export default router;
