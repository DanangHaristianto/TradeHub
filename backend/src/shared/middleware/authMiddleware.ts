import { Request, Response, NextFunction } from 'express';
import { IRequestUser } from '@shared/types';
import { AppError } from '@shared/middleware/errorHandler';
import { verifyToken } from '@shared/utils/helpers';

declare global {
  namespace Express {
    interface Request {
      user?: IRequestUser;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new AppError(401, 'Token tidak ditemukan');
    }

    const secret = process.env.JWT_SECRET || 'access_secret';
    const decoded = verifyToken(token, secret);

    if (!decoded) {
      throw new AppError(401, 'Token tidak valid');
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
