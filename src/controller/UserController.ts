// src/controller/UserController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import bcrypt from 'bcrypt';

export class UserController {
  static async getAll(req: Request, res: Response) {
    const users = await AppDataSource.getRepository(User).find({ relations: ['division'] });
    return res.json(users);
  }

  static async getById(req: Request, res: Response) {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['division']
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  }

  static async create(req: Request, res: Response) {
    const userRepo = AppDataSource.getRepository(User);
    const { email, fullName, password, divisionId, role } = req.body;

    // Hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = userRepo.create({ email, fullName, passwordHash, role, division: { id: divisionId } });
    await userRepo.save(user);
    return res.status(201).json(user);
  }
} 