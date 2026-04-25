// src/controller/UserController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import bcrypt from 'bcrypt';

export class UserController {
  static async getAll(req: Request, res: Response) {
    const users = await AppDataSource.getRepository(User).find({ relations: ['division'] });
    const safeUsers = users.map(({ passwordHash, ...user }) => user);
    return res.json(safeUsers);
  }

  static async getById(req: Request, res: Response) {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['division']
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { passwordHash, ...safeUser } = user;
    return res.json(safeUser);
  }

  static async create(req: Request, res: Response) {
    const userRepo = AppDataSource.getRepository(User);
    const { email, fullName, full_name, password, divisionId, division_id, role } = req.body;
    const resolvedFullName = fullName || full_name;
    const resolvedDivisionId = divisionId ?? division_id;

    if (!email || !resolvedFullName || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['admin', 'economist'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (role === 'economist' && !resolvedDivisionId) {
      return res.status(400).json({ message: 'Division is required for economist users' });
    }

    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = userRepo.create({
      email,
      fullName: resolvedFullName,
      passwordHash,
      role,
      ...(resolvedDivisionId ? { division: { id: Number(resolvedDivisionId) } } : {}),
    });
    const savedUser = await userRepo.save(user);
    const userWithDivision = await userRepo.findOne({
      where: { id: savedUser.id },
      relations: ['division'],
    });

    if (!userWithDivision) {
      return res.status(500).json({ message: 'User created but could not be retrieved' });
    }

    const { passwordHash: _, ...safeUser } = userWithDivision;
    return res.status(201).json(safeUser);
  }

  static async delete(req: Request, res: Response) {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await userRepo.remove(user);
    return res.json({ message: 'User deleted successfully' });
  }
} 