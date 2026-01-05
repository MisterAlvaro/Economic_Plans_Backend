// src/controller/AuthController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { RevokedToken } from '../entity/RevokedToken';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

export class AuthController {
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email }, relations: ['division'] });

    if (!user || !user.is_active) return res.status(401).json({ message: 'Invalid credentials' });

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: user.id, email: user.email, role: user.role, divisionId: user.division.id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 8 * 60 * 60 * 1000
      })
      .json({ refreshToken, user });
  }

  static async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token is required' });

    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET);
      
      // Remover propiedades de tiempo del payload decodificado
      const { iat, exp, ...payload } = decoded as any;
      const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 8 * 60 * 60 * 1000
      });
      return res.json({ token: newToken });
    } catch (err) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
  }

  static async logout(req: Request, res: Response) {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded: any = jwt.decode(token);
      const expiresAt = new Date(decoded.exp * 1000);
      const revokedRepo = AppDataSource.getRepository(RevokedToken);
      const record = revokedRepo.create({ token, expiresAt });
      await revokedRepo.save(record);
    }
    res.clearCookie('token');
    return res.json({ message: 'Logged out successfully' });
  }
} 