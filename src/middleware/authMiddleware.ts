// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { RevokedToken } from '../entity/RevokedToken';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// Extend Request interface to include user property
export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Missing token' });

  const revokedRepo = AppDataSource.getRepository(RevokedToken);
  const revoked = await revokedRepo.findOneBy({ token });
  if (revoked) return res.status(401).json({ message: 'Token has been revoked' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
} 

export function authorizeRoles(...allowedRoles: Array<'admin' | 'economist'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}