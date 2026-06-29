import { Request, Response, NextFunction } from 'express';
import { validate } from '@shared/utils/validators';
import { AppError } from '@shared/middleware/errorHandler';

export const validationMiddleware = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = validate(schema, req.body);

    if (error) {
      const message = error.details.map((d: any) => d.message).join(', ');
      throw new AppError(400, message);
    }

    req.body = value;
    next();
  };
};
