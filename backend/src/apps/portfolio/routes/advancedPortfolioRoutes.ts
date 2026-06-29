import { Router, Request, Response } from 'express';
import { authMiddleware } from '@shared/middleware/authMiddleware';
import { AdvancedPortfolioService } from '@apps/portfolio/services/advancedPortfolioService';
import { asyncHandler } from '@shared/middleware/errorHandler';

const router = Router();
const advancedService = new AdvancedPortfolioService();

// Get portfolio metrics
router.get(
  '/:id/metrics',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const metrics = await advancedService.calculatePortfolioMetrics(req.params.id);
    res.json({
      success: true,
      data: metrics,
    });
  })
);

// Get trading performance
router.get(
  '/:id/performance',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const performance = await advancedService.analyzeTradingPerformance(req.params.id);
    res.json({
      success: true,
      data: performance,
    });
  })
);

// Rebalance portfolio
router.post(
  '/:id/rebalance',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { targetAllocation } = req.body;
    const orders = await advancedService.rebalancePortfolio(req.params.id, targetAllocation);
    res.json({
      success: true,
      data: orders,
    });
  })
);

export default router;
