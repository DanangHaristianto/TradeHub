import { Router, Request, Response } from 'express';
import { authMiddleware } from '@shared/middleware/authMiddleware';
import { validationMiddleware } from '@shared/middleware/validationMiddleware';
import { portfolioSchema } from '@shared/utils/validators';
import { PortfolioService } from '@apps/portfolio/services/portfolioService';
import { asyncHandler } from '@shared/middleware/errorHandler';

const router = Router();
const portfolioService = new PortfolioService();

// Get all portfolios
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const portfolios = await portfolioService.getUserPortfolios(req.user!.id);
    res.json({
      success: true,
      data: portfolios,
    });
  })
);

// Get portfolio by ID
router.get(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const portfolio = await portfolioService.getPortfolioById(req.params.id, req.user!.id);
    res.json({
      success: true,
      data: portfolio,
    });
  })
);

// Create portfolio
router.post(
  '/',
  authMiddleware,
  validationMiddleware(portfolioSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const portfolio = await portfolioService.createPortfolio(req.user!.id, name, description);
    res.status(201).json({
      success: true,
      data: portfolio,
    });
  })
);

// Update portfolio
router.put(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const portfolio = await portfolioService.updatePortfolio(req.params.id, req.user!.id, name, description);
    res.json({
      success: true,
      data: portfolio,
    });
  })
);

// Delete portfolio
router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    await portfolioService.deletePortfolio(req.params.id, req.user!.id);
    res.json({
      success: true,
      message: 'Portfolio deleted successfully',
    });
  })
);

export default router;
