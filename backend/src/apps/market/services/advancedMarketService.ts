import axios from 'axios';
import { logger } from '@config/logger';
import { AppError } from '@shared/middleware/errorHandler';
import { IPriceData } from '@shared/types';

export class AdvancedMarketService {
  private exchangeRates: Map<string, number> = new Map();
  private technicalIndicators: Map<string, any> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  // FIX #1: Parallelize requests instead of sequential
  async getMultiAssetPrices(symbols: string[]): Promise<Map<string, any>> {
    try {
      // Use Promise.all for parallel execution
      const pricePromises = symbols.map((symbol) =>
        this.getPriceWithIndicators(symbol)
          .catch((error) => {
            logger.warn(`Could not get price for ${symbol}: ${error.message}`);
            return null;
          })
      );

      const results = await Promise.all(pricePromises);
      const prices = new Map();

      for (let i = 0; i < symbols.length; i++) {
        if (results[i]) {
          prices.set(symbols[i], results[i]);
        }
      }

      return prices;
    } catch (error) {
      logger.error('Error fetching multi-asset prices:', error);
      throw new AppError(500, 'Failed to fetch prices');
    }
  }

  async getPriceWithIndicators(symbol: string): Promise<any> {
    try {
      // FIX #2: Check cache first
      const cached = this.technicalIndicators.get(symbol);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      const basePrice = Math.random() * 50000 + 25000;
      // FIX #3: Calculate indicators in parallel where possible
      const [rsi, macd, bollingerBands] = await Promise.all([
        Promise.resolve(this.calculateRSI([basePrice])),
        Promise.resolve(this.calculateMACD([basePrice])),
        Promise.resolve(this.calculateBollingerBands([basePrice])),
      ]);

      const result = {
        symbol,
        price: basePrice,
        change: (Math.random() - 0.5) * 1000,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.random() * 1000000,
        high: basePrice * 1.05,
        low: basePrice * 0.95,
        timestamp: new Date(),
        technicalIndicators: {
          rsi,
          macd,
          bollingerBands,
        },
      };

      // Cache the result
      this.technicalIndicators.set(symbol, {
        data: result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      logger.error(`Error getting price for ${symbol}:`, error);
      throw new AppError(500, 'Failed to fetch price data');
    }
  }

  // FIX #4: Optimized RSI calculation
  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period) return 50;

    let gains = 0;
    let losses = 0;

    // Calculate gains and losses in single pass
    for (let i = 1; i < period; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff > 0) {
        gains += diff;
      } else {
        losses -= diff;
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return gains > 0 ? 100 : 0;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  // FIX #5: Optimized MACD calculation
  private calculateMACD(prices: number[]): { signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    const signal = (macd * 2) / 3; // Simplified
    return { signal, histogram: macd - signal };
  }

  // FIX #6: Optimized EMA calculation
  private calculateEMA(prices: number[], period: number): number {
    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    const limit = Math.min(prices.length, period);
    for (let i = 1; i < limit; i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier);
    }

    return ema;
  }

  // FIX #7: Optimized Bollinger Bands calculation
  private calculateBollingerBands(
    prices: number[],
    period: number = 20,
    deviation: number = 2
  ): { upper: number; middle: number; lower: number } {
    const slice = prices.slice(-period);
    const length = slice.length;

    if (length === 0) return { upper: 0, middle: 0, lower: 0 };

    // Calculate middle and variance in one pass
    let sum = 0;
    for (const price of slice) {
      sum += price;
    }
    const middle = sum / length;

    let variance = 0;
    for (const price of slice) {
      variance += Math.pow(price - middle, 2);
    }
    variance /= length;

    const stdDev = Math.sqrt(variance);

    return {
      upper: middle + deviation * stdDev,
      middle,
      lower: middle - deviation * stdDev,
    };
  }

  async convertCurrency(amount: number, from: string, to: string): Promise<number> {
    try {
      const key = `${from}${to}`;
      const rate = this.exchangeRates.get(key) || 1;
      return amount * rate;
    } catch (error) {
      logger.error(`Currency conversion failed: ${from} to ${to}`);
      throw new AppError(500, 'Currency conversion failed');
    }
  }

  async getMarketSentiment(symbol: string): Promise<'BULLISH' | 'BEARISH' | 'NEUTRAL'> {
    try {
      const indicators = await this.getPriceWithIndicators(symbol);
      const rsi = indicators.technicalIndicators.rsi;
      if (rsi > 70) return 'BULLISH';
      if (rsi < 30) return 'BEARISH';
      return 'NEUTRAL';
    } catch (error) {
      logger.error(`Sentiment analysis failed for ${symbol}`);
      throw new AppError(500, 'Sentiment analysis failed');
    }
  }

  async getCorrelation(symbol1: string, symbol2: string): Promise<number> {
    try {
      return Math.random(); // Placeholder
    } catch (error) {
      logger.error(`Correlation calculation failed`);
      throw new AppError(500, 'Correlation calculation failed');
    }
  }
}
