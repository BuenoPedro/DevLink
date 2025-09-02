import { Response } from 'express';
import { prisma } from '../db';
import { AuthedRequest } from '../middlewares/auth';

export async function requestConnection(req: AuthedRequest, res: Response) {
  const requesterId = req.user!.id; // bigint
  const { addresseeId } = req.body;

  const addressee = BigInt(addresseeId);
  if (addressee === requesterId) {
    return res.status(400).json({ error: 'Self connection not allowed' });
  }

  await prisma.connection.upsert({
    where: { requesterId_addresseeId: { requesterId, addresseeId: addressee } },
    update: { status: 'PENDING', actedAt: null },
    create: { requesterId, addresseeId: addressee },
  });

  res.status(201).end();
}

export async function respondConnection(req: AuthedRequest, res: Response) {
  const userId = req.user!.id; // bigint
  const { connectionId, action } = req.body; // ACCEPT | REJECT | BLOCK

  const status = action === 'ACCEPT' ? 'ACCEPTED' : action === 'REJECT' ? 'REJECTED' : action === 'BLOCK' ? 'BLOCKED' : null;

  if (!status) return res.status(400).json({ error: 'Invalid action' });

  const result = await prisma.connection.updateMany({
    where: { id: BigInt(connectionId), addresseeId: userId },
    data: { status, actedAt: new Date() },
  });

  if (result.count === 0) return res.status(404).json({ error: 'Connection not found' });
  res.status(204).end();
}

export async function myConnections(req: AuthedRequest, res: Response) {
  const userId = req.user!.id;
  const cons = await prisma.connection.findMany({
    where: { OR: [{ requesterId: userId }, { addresseeId: userId }] },
    orderBy: { createdAt: 'desc' },
  });
  res.json(cons);
}

export async function myRequests(req: AuthedRequest, res: Response) {
  const userId = req.user!.id;
  const reqs = await prisma.connection.findMany({
    where: { addresseeId: userId, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });
  res.json(reqs);
}
