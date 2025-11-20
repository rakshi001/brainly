import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers['authorization'];
  const decoded = jwt.verify(header as string, JWT_SECRET) as {
    userId: string;
  };
  if (decoded) {
    (req as any).userId = decoded.userId;
    next();
  } else {
    res.status(401).json({
      message: 'not logged in ',
    });
  }
};
