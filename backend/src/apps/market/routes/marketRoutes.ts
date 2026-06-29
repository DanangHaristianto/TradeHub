import { Router, Request, Response } from 'express';
import { MarketService } from '@apps/market/services/marketService';
import { asyncHandler } from '@shared/middleware/errorHandler';

const router = Router();
const marketService = new MarketService();

// Get price
router.get(
  '/prices/:symbol',
  asyncHandler(async (req: Request, res: Response) => {
    const { symbol } = req.params;
    const price = await marketService.getPrice(symbol);
    res.json({
      success: true,
      data: price,
    });
  })
);

// Get multiple prices
router.get(
  '/prices',
  asyncHandler(async (req: Request, res: Response) => {
    const { symbols } = req.query;
    const symbolArray = (symbols as string).split(',');
    const prices = await marketService.getPrices(symbolArray);
    res.json({
      success: true,
      data: Array.from(prices.values()),
    });
  })
);

// Get price history
router.get(
  '/historical/:symbol',
  asyncHandler(async (req: Request, res: Response) => {
    const { symbol } = req.params;
    const { startDate, endDate, interval } = req.query;
    const history = await marketService.getPriceHistory(
      symbol,
      new Date(startDate as string),
      new Date(endDate as string),
      (interval as any) || 'daily'
    );
    res.json({
      success: true,
      data: history,
    });
  })
);

// Get supported symbols
router.get(
  '/symbols',
  asyncHandler(async (req: Request, res: Response) => {
    const symbols = await marketService.getSupportedSymbols();
    res.json({
      success: true,
      data: symbols,
    });
  })
);

export default router;
