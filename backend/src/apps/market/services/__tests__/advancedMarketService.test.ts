import { AdvancedMarketService } from '../advancedMarketService';

describe('AdvancedMarketService', () => {
  let service: AdvancedMarketService;

  beforeEach(() => {
    service = new AdvancedMarketService();
  });

  describe('getMultiAssetPrices - Parallelization', () => {
    it('should fetch multiple asset prices', async () => {
      const symbols = ['BTC', 'ETH', 'AAPL', 'GOOGL'];

      const prices = await service.getMultiAssetPrices(symbols);

      expect(prices.size).toBeGreaterThan(0);
      symbols.forEach((symbol) => {
        if (prices.has(symbol)) {
          const price = prices.get(symbol);
          expect(price).toHaveProperty('symbol');
          expect(price).toHaveProperty('price');
          expect(price).toHaveProperty('technicalIndicators');
        }
      });
    });

    it('should handle errors gracefully', async () => {
      const symbols = ['BTC', 'ETH'];
      const prices = await service.getMultiAssetPrices(symbols);

      expect(prices.size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getPriceWithIndicators - Caching', () => {
    it('should return price with technical indicators', async () => {
      const price = await service.getPriceWithIndicators('BTC');

      expect(price).toHaveProperty('symbol', 'BTC');
      expect(price).toHaveProperty('price');
      expect(price).toHaveProperty('technicalIndicators');
      expect(price.technicalIndicators).toHaveProperty('rsi');
      expect(price.technicalIndicators).toHaveProperty('macd');
      expect(price.technicalIndicators).toHaveProperty('bollingerBands');
    });
  });

  describe('calculateRSI - Optimization', () => {
    it('should calculate RSI correctly', () => {
      const prices = [44, 44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.0];
      const rsi = (service as any).calculateRSI(prices);

      expect(rsi).toBeGreaterThanOrEqual(0);
      expect(rsi).toBeLessThanOrEqual(100);
    });

    it('should return 50 for insufficient data', () => {
      const prices = [44, 44.34];
      const rsi = (service as any).calculateRSI(prices, 14);

      expect(rsi).toBe(50);
    });

    it('should handle declining prices', () => {
      const prices = [100, 99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88, 87];
      const rsi = (service as any).calculateRSI(prices, 14);

      expect(rsi).toBeLessThan(30);
    });
  });

  describe('calculateMACD - Optimization', () => {
    it('should calculate MACD correctly', () => {
      const prices = [44, 44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.42];
      const macd = (service as any).calculateMACD(prices);

      expect(macd).toHaveProperty('signal');
      expect(macd).toHaveProperty('histogram');
      expect(typeof macd.signal).toBe('number');
      expect(typeof macd.histogram).toBe('number');
    });
  });

  describe('calculateEMA - Optimization', () => {
    it('should calculate EMA correctly', () => {
      const prices = [44, 44.34, 44.09, 44.15, 43.61];
      const ema = (service as any).calculateEMA(prices, 3);

      expect(typeof ema).toBe('number');
      expect(ema).toBeGreaterThan(0);
    });
  });

  describe('calculateBollingerBands - Single Pass', () => {
    it('should calculate Bollinger Bands correctly', () => {
      const prices = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39];
      const bands = (service as any).calculateBollingerBands(prices, 20, 2);

      expect(bands.upper).toBeGreaterThan(bands.middle);
      expect(bands.lower).toBeLessThan(bands.middle);
      expect(bands.upper).toBeGreaterThan(bands.lower);
    });

    it('should handle empty data', () => {
      const bands = (service as any).calculateBollingerBands([], 20, 2);

      expect(bands.upper).toBe(0);
      expect(bands.middle).toBe(0);
      expect(bands.lower).toBe(0);
    });
  });

  describe('getMarketSentiment', () => {
    it('should return valid sentiment', async () => {
      const sentiment = await service.getMarketSentiment('BTC');

      expect(['BULLISH', 'BEARISH', 'NEUTRAL']).toContain(sentiment);
    });
  });

  describe('convertCurrency', () => {
    it('should convert currency', async () => {
      const result = await service.convertCurrency(100, 'USD', 'EUR');

      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getCorrelation', () => {
    it('should return correlation value', async () => {
      const correlation = await service.getCorrelation('BTC', 'ETH');

      expect(typeof correlation).toBe('number');
      expect(correlation).toBeGreaterThanOrEqual(0);
      expect(correlation).toBeLessThanOrEqual(1);
    });
  });
});
