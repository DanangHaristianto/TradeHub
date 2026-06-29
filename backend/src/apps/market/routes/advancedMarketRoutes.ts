import { Router, Request, Response } from 'express';
import { authMiddleware } from '@shared/middleware/authMiddleware';
import { AdvancedMarketService } from '@apps/market/services/advancedMarketService';
import { asyncHandler } from '@shared/middleware/errorHandler';

const router = Router();
const marketService = new AdvancedMarketService();

// Get price with technical indicators
router.get(
  '/technical/:symbol',
  asyncHandler(async (req: Request, res: Response) => {
    const data = await marketService.getPriceWithIndicators(req.params.symbol);
    res.json({
      success: true,
      data,
    });
  })
);

// Get multiple prices with indicators
router.post(
  '/technical/batch',
  asyncHandler(async (req: Request, res: Response) => {
    const { symbols } = req.body;
    const prices = await marketService.getMultiAssetPrices(symbols);
    res.json({
      success: true,
      data: Array.from(prices.values()),
    });
  })
);

// Get market sentiment
router.get(
  '/sentiment/:symbol',
  asyncHandler(async (req: Request, res: Response) => {
    const sentiment = await marketService.getMarketSentiment(req.params.symbol);
    res.json({
      success: true,
      data: { sentiment },
    });
  })
);

// Get correlation
router.post(
  '/correlation',
  asyncHandler(async (req: Request, res: Response) => {
    const { symbol1, symbol2 } = req.body;
    const correlation = await marketService.getCorrelation(symbol1, symbol2);
    res.json({
      success: true,
      data: { correlation },
    });
  })
);

// Convert currency
router.post(
  '/convert',
  asyncHandler(async (req: Request, res: Response) => {
    const { amount, from, to } = req.body;
    const converted = await marketService.convertCurrency(amount, from, to);
    res.json({
      success: true,
      data: { converted },
    });
  })
);

export default router;
