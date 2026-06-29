import { Router, Request, Response } from 'express';
import { authMiddleware } from '@shared/middleware/authMiddleware';
import { RiskManagementService } from '@apps/portfolio/services/riskManagementService';
import { asyncHandler } from '@shared/middleware/errorHandler';

const router = Router();
const riskService = new RiskManagementService();

// Assess portfolio risk
router.get(
  '/assessment/:portfolioId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const risk = await riskService.assessPortfolioRisk(req.params.portfolioId);
    res.json({
      success: true,
      data: risk,
    });
  })
);

// Get stop loss suggestion
router.post(
  '/stop-loss/suggest',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { symbol, entryPrice, riskPercentage } = req.body;
    const stopLoss = await riskService.suggestStopLoss(symbol, entryPrice, riskPercentage);
    res.json({
      success: true,
      data: { stopLossPrice: stopLoss },
    });
  })
);

// Get take profit suggestion
router.post(
  '/take-profit/suggest',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { symbol, entryPrice, rewardRatio } = req.body;
    const takeProfit = await riskService.suggestTakeProfit(symbol, entryPrice, rewardRatio);
    res.json({
      success: true,
      data: { takeProfitPrice: takeProfit },
    });
  })
);

// Check position sizing
router.post(
  '/position-sizing',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { portfolioValue, riskPercentage, symbol } = req.body;
    const size = await riskService.checkPositionSizing(portfolioValue, riskPercentage, symbol);
    res.json({
      success: true,
      data: { recommendedSize: size },
    });
  })
);

// Monitor risk exposure
router.get(
  '/exposure/:portfolioId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const exposure = await riskService.monitorRiskExposure(req.params.portfolioId);
    res.json({
      success: true,
      data: exposure,
    });
  })
);

export default router;
