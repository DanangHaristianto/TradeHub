import { Router, Request, Response } from 'express';
import { authMiddleware } from '@shared/middleware/authMiddleware';
import { asyncHandler } from '@shared/middleware/errorHandler';
import { AppDataSource } from '@config/database';
import { generateId } from '@shared/utils/helpers';

const router = Router();

// Get all strategies
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const strategyRepository = AppDataSource.getRepository('Strategy');
    const strategies = await strategyRepository.find({
      where: { userId: req.user!.id },
      order: { createdAt: 'DESC' },
    });
    res.json({
      success: true,
      data: strategies,
    });
  })
);

// Create strategy
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { name, description, type, logic, targetSymbols, capital, riskPerTrade } = req.body;
    const strategyRepository = AppDataSource.getRepository('Strategy');
    const strategy = strategyRepository.create({
      id: generateId(),
      userId: req.user!.id,
      name,
      description,
      type,
      logic,
      targetSymbols,
      capital,
      riskPerTrade,
      status: 'DRAFT',
    });
    await strategyRepository.save(strategy);
    res.status(201).json({
      success: true,
      data: strategy,
    });
  })
);

// Get strategy by ID
router.get(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const strategyRepository = AppDataSource.getRepository('Strategy');
    const strategy = await strategyRepository.findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!strategy) {
      return res.status(404).json({ success: false, error: { message: 'Strategy not found' } });
    }
    res.json({
      success: true,
      data: strategy,
    });
  })
);

// Update strategy
router.put(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { name, description, logic, targetSymbols, status } = req.body;
    const strategyRepository = AppDataSource.getRepository('Strategy');
    const strategy = await strategyRepository.findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!strategy) {
      return res.status(404).json({ success: false, error: { message: 'Strategy not found' } });
    }
    strategy.name = name || strategy.name;
    strategy.description = description || strategy.description;
    strategy.logic = logic || strategy.logic;
    strategy.targetSymbols = targetSymbols || strategy.targetSymbols;
    strategy.status = status || strategy.status;
    await strategyRepository.save(strategy);
    res.json({
      success: true,
      data: strategy,
    });
  })
);

// Activate strategy
router.post(
  '/:id/activate',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const strategyRepository = AppDataSource.getRepository('Strategy');
    const strategy = await strategyRepository.findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!strategy) {
      return res.status(404).json({ success: false, error: { message: 'Strategy not found' } });
    }
    strategy.status = 'ACTIVE';
    await strategyRepository.save(strategy);
    res.json({
      success: true,
      data: strategy,
    });
  })
);

// Pause strategy
router.post(
  '/:id/pause',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const strategyRepository = AppDataSource.getRepository('Strategy');
    const strategy = await strategyRepository.findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!strategy) {
      return res.status(404).json({ success: false, error: { message: 'Strategy not found' } });
    }
    strategy.status = 'PAUSED';
    await strategyRepository.save(strategy);
    res.json({
      success: true,
      data: strategy,
    });
  })
);

// Delete strategy
router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const strategyRepository = AppDataSource.getRepository('Strategy');
    await strategyRepository.delete({
      id: req.params.id,
      userId: req.user!.id,
    });
    res.json({
      success: true,
      message: 'Strategy deleted',
    });
  })
);

export default router;
