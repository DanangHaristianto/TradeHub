import { Router, Request, Response } from 'express';
import { authMiddleware } from '@shared/middleware/authMiddleware';
import { BacktestingService } from '@apps/trading/services/backtestingService';
import { asyncHandler } from '@shared/middleware/errorHandler';

const router = Router();
const backtestService = new BacktestingService();

// Backtest strategy
router.post(
  '/backtest',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { strategy, startDate, endDate, historicalData } = req.body;
    const result = await backtestService.backtestStrategy(
      strategy,
      new Date(startDate),
      new Date(endDate),
      historicalData
    );
    res.json({
      success: true,
      data: result,
    });
  })
);

// Optimize strategy parameters
router.post(
  '/optimize',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { strategy, parameters } = req.body;
    const result = await backtestService.optimizeStrategy(strategy, parameters);
    res.json({
      success: true,
      data: result,
    });
  })
);

export default router;
