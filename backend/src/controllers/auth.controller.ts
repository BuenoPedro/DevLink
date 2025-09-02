import { Request, Response } from 'express';
import { prisma } from '../db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthedRequest } from '../middlewares/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'devlink-secret';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2).max(60).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function signToken(user: { id: bigint; role: string }) {
  return jwt.sign({ role: user.role }, JWT_SECRET, {
    subject: user.id.toString(),
    expiresIn: '7d',
  });
}

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) return res.status(409).json({ message: 'E-mail já cadastrado' });

  const hash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: hash,
      profile: data.displayName ? { create: { displayName: data.displayName } } : undefined,
    },
  });

  const token = signToken({ id: user.id, role: user.role });
  return res.status(201).json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

  const ok = await bcrypt.compare(data.password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Credenciais inválidas' });

  const token = signToken({ id: user.id, role: user.role });
  return res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
}

export async function me(req: Request, res: Response) {
  // @ts-ignore
  const userId: bigint = req.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      skills: { include: { skill: true } },
      experiences: true, // ← NOVO
    },
  });
  return res.json({ user });
}
