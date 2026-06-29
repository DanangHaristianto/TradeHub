import dotenv from 'dotenv';

dotenv.config();

export const config = {
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001'),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'tradehub_user',
    password: process.env.DB_PASSWORD || 'changeme',
    database: process.env.DB_NAME || 'tradehub_db',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'access_secret',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
    accessTokenExpiry: process.env.JWT_EXPIRY || '7d',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '30d',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
  },
};
