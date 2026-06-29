import authRoutes from '@apps/auth/routes/authRoutes';
import userRoutes from '@apps/user/routes/userRoutes';
import portfolioRoutes from '@apps/portfolio/routes/portfolioRoutes';
import advancedPortfolioRoutes from '@apps/portfolio/routes/advancedPortfolioRoutes';
import riskManagementRoutes from '@apps/portfolio/routes/riskManagementRoutes';
import marketRoutes from '@apps/market/routes/marketRoutes';
import advancedMarketRoutes from '@apps/market/routes/advancedMarketRoutes';
import watchlistRoutes from '@apps/market/routes/watchlistRoutes';
import alertRoutes from '@apps/market/routes/alertRoutes';
import tradingRoutes from '@apps/trading/routes/tradingRoutes';
import backtestingRoutes from '@apps/trading/routes/backtestingRoutes';
import strategyRoutes from '@apps/trading/routes/strategyRoutes';
import { Router } from 'express';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/portfolio/advanced', advancedPortfolioRoutes);
router.use('/portfolio/risk', riskManagementRoutes);
router.use('/market', marketRoutes);
router.use('/market/advanced', advancedMarketRoutes);
router.use('/watchlists', watchlistRoutes);
router.use('/alerts', alertRoutes);
router.use('/trading', tradingRoutes);
router.use('/trading/backtest', backtestingRoutes);
router.use('/strategies', strategyRoutes);

export default router;
