import { Router, Request, Response } from 'express';
import { authMiddleware } from '@shared/middleware/authMiddleware';
import { asyncHandler } from '@shared/middleware/errorHandler';
import { AppDataSource } from '@config/database';
import { generateId } from '@shared/utils/helpers';

const router = Router();

// Get all watchlists
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const watchlistRepository = AppDataSource.getRepository('Watchlist');
    const watchlists = await watchlistRepository.find({
      where: { userId: req.user!.id },
    });
    res.json({
      success: true,
      data: watchlists,
    });
  })
);

// Create watchlist
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { name, description, symbols } = req.body;
    const watchlistRepository = AppDataSource.getRepository('Watchlist');
    const watchlist = watchlistRepository.create({
      id: generateId(),
      userId: req.user!.id,
      name,
      description,
      symbols,
      isDefault: false,
    });
    await watchlistRepository.save(watchlist);
    res.status(201).json({
      success: true,
      data: watchlist,
    });
  })
);

// Update watchlist
router.put(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { name, description, symbols } = req.body;
    const watchlistRepository = AppDataSource.getRepository('Watchlist');
    const watchlist = await watchlistRepository.findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!watchlist) {
      return res.status(404).json({ success: false, error: { message: 'Watchlist not found' } });
    }
    watchlist.name = name;
    watchlist.description = description;
    watchlist.symbols = symbols;
    await watchlistRepository.save(watchlist);
    res.json({
      success: true,
      data: watchlist,
    });
  })
);

// Delete watchlist
router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const watchlistRepository = AppDataSource.getRepository('Watchlist');
    const result = await watchlistRepository.delete({
      id: req.params.id,
      userId: req.user!.id,
    });
    res.json({
      success: true,
      message: 'Watchlist deleted',
    });
  })
);

// Add symbol to watchlist
router.post(
  '/:id/symbols',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { symbol } = req.body;
    const watchlistRepository = AppDataSource.getRepository('Watchlist');
    const watchlist = await watchlistRepository.findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!watchlist) {
      return res.status(404).json({ success: false, error: { message: 'Watchlist not found' } });
    }
    if (!watchlist.symbols.includes(symbol)) {
      watchlist.symbols.push(symbol);
      await watchlistRepository.save(watchlist);
    }
    res.json({
      success: true,
      data: watchlist,
    });
  })
);

// Remove symbol from watchlist
router.delete(
  '/:id/symbols/:symbol',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const watchlistRepository = AppDataSource.getRepository('Watchlist');
    const watchlist = await watchlistRepository.findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!watchlist) {
      return res.status(404).json({ success: false, error: { message: 'Watchlist not found' } });
    }
    watchlist.symbols = watchlist.symbols.filter((s) => s !== req.params.symbol);
    await watchlistRepository.save(watchlist);
    res.json({
      success: true,
      data: watchlist,
    });
  })
);

export default router;
