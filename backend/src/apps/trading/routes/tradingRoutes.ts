import { Router, Request, Response } from 'express';
import { authMiddleware } from '@shared/middleware/authMiddleware';
import { validationMiddleware } from '@shared/middleware/validationMiddleware';
import { orderSchema } from '@shared/utils/validators';
import { TradingService } from '@apps/trading/services/tradingService';
import { asyncHandler } from '@shared/middleware/errorHandler';

const router = Router();
const tradingService = new TradingService();

// Place order
router.post(
  '/orders',
  authMiddleware,
  validationMiddleware(orderSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { portfolioId, symbol, orderType, quantity, price } = req.body;
    const order = await tradingService.placeOrder(portfolioId, symbol, orderType, quantity, price);
    res.status(201).json({
      success: true,
      data: order,
    });
  })
);

// Get order history
router.get(
  '/orders',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { portfolioId } = req.query;
    const orders = await tradingService.getOrderHistory(portfolioId as string);
    res.json({
      success: true,
      data: orders,
    });
  })
);

// Cancel order
router.delete(
  '/orders/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { portfolioId } = req.query;
    const order = await tradingService.cancelOrder(id, portfolioId as string);
    res.json({
      success: true,
      data: order,
    });
  })
);

export default router;
