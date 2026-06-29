export const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[TradeHub]', ...args);
    }
  },
  error: (...args: any[]) => {
    console.error('[TradeHub Error]', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('[TradeHub Warning]', ...args);
  },
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info('[TradeHub Info]', ...args);
    }
  },
};
