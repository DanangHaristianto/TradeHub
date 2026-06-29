import { AppDataSource } from '@config/database';
import { generateId } from '@shared/utils/helpers';
import { AppError } from '@shared/middleware/errorHandler';
import { IOrder } from '@shared/types';
import { logger } from '@config/logger';
import { MarketService } from '@apps/market/services/marketService';

export class TradingService {
  private marketService = new MarketService();

  async placeOrder(
    portfolioId: string,
    symbol: string,
    orderType: 'BUY' | 'SELL',
    quantity: number,
    price: number
  ): Promise<IOrder> {
    const orderRepository = AppDataSource.getRepository('Order');
    const portfolioRepository = AppDataSource.getRepository('Portfolio');

    const portfolio = await portfolioRepository.findOne({ where: { id: portfolioId } });
    if (!portfolio) {
      throw new AppError(404, 'Portfolio tidak ditemukan');
    }

    const currentPriceData = await this.marketService.getPrice(symbol);
    const totalCost = quantity * currentPriceData.price;

    if (orderType === 'BUY' && portfolio.cashBalance < totalCost) {
      throw new AppError(400, 'Saldo tidak cukup untuk membeli');
    }

    const order = orderRepository.create({
      id: generateId(),
      portfolioId,
      symbol,
      orderType,
      quantity,
      price: currentPriceData.price,
      status: 'FILLED',
      fee: totalCost * 0.001,
    });

    await this.executeOrder(order, portfolio);
    await orderRepository.save(order);

    logger.info(`Order placed: ${order.id} - ${orderType} ${quantity} ${symbol}`);

    return order;
  }

  private async executeOrder(order: IOrder, portfolio: any): Promise<void> {
    const transactionRepository = AppDataSource.getRepository('Transaction');
    const positionRepository = AppDataSource.getRepository('Position');
    const portfolioRepository = AppDataSource.getRepository('Portfolio');

    const totalAmount = order.quantity * order.price + (order.fee || 0);

    if (order.orderType === 'BUY') {
      portfolio.cashBalance -= totalAmount;

      let position = await positionRepository.findOne({
        where: { portfolioId: order.portfolioId, symbol: order.symbol },
      });

      if (position) {
        const totalQuantity = position.quantity + order.quantity;
        position.averagePrice =
          (position.averagePrice * position.quantity + order.price * order.quantity) / totalQuantity;
        position.quantity = totalQuantity;
      } else {
        position = positionRepository.create({
          id: generateId(),
          portfolioId: order.portfolioId,
          symbol: order.symbol,
          quantity: order.quantity,
          averagePrice: order.price,
          currentPrice: order.price,
          marketValue: order.quantity * order.price,
          gainLoss: 0,
          gainLossPercent: 0,
        });
      }

      position.currentPrice = order.price;
      position.marketValue = position.quantity * position.currentPrice;
      position.gainLoss = (position.currentPrice - position.averagePrice) * position.quantity;
      position.gainLossPercent = ((position.currentPrice - position.averagePrice) / position.averagePrice) * 100;
      position.updatedAt = new Date();

      await positionRepository.save(position);
    } else if (order.orderType === 'SELL') {
      portfolio.cashBalance += totalAmount - (order.fee || 0);

      const position = await positionRepository.findOne({
        where: { portfolioId: order.portfolioId, symbol: order.symbol },
      });

      if (position) {
        position.quantity -= order.quantity;
        if (position.quantity <= 0) {
          await positionRepository.remove(position);
        } else {
          position.marketValue = position.quantity * position.currentPrice;
          position.gainLoss = (position.currentPrice - position.averagePrice) * position.quantity;
          position.gainLossPercent = ((position.currentPrice - position.averagePrice) / position.averagePrice) * 100;
          position.updatedAt = new Date();
          await positionRepository.save(position);
        }
      }
    }

    portfolio.updatedAt = new Date();
    await portfolioRepository.save(portfolio);

    const transaction = transactionRepository.create({
      id: generateId(),
      portfolioId: order.portfolioId,
      orderId: order.id,
      type: order.orderType,
      symbol: order.symbol,
      quantity: order.quantity,
      price: order.price,
      amount: order.quantity * order.price,
      fee: order.fee,
    });

    await transactionRepository.save(transaction);
  }

  async getOrderHistory(portfolioId: string): Promise<IOrder[]> {
    const orderRepository = AppDataSource.getRepository('Order');
    const orders = await orderRepository.find({
      where: { portfolioId },
      order: { createdAt: 'DESC' },
    });

    return orders;
  }

  async cancelOrder(orderId: string, portfolioId: string): Promise<IOrder> {
    const orderRepository = AppDataSource.getRepository('Order');
    const order = await orderRepository.findOne({
      where: { id: orderId, portfolioId },
    });

    if (!order) {
      throw new AppError(404, 'Order tidak ditemukan');
    }

    if (order.status !== 'PENDING') {
      throw new AppError(400, 'Hanya order PENDING yang dapat dibatalkan');
    }

    order.status = 'CANCELLED';
    order.updatedAt = new Date();
    await orderRepository.save(order);

    logger.info(`Order cancelled: ${orderId}`);

    return order;
  }
}
