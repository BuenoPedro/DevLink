import { Request, Response } from 'express';
import { prisma } from '../db';
import { z } from 'zod';

// --- helpers para limpar campos vazios --- //
const emptyToUndef = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

const optStr = (min: number, max: number) => z.preprocess(emptyToUndef, z.string().min(min).max(max).optional());

const optStrMax = (max: number) => z.preprocess(emptyToUndef, z.string().max(max).optional());

const optUrl = z.preprocess(emptyToUndef, z.string().url().optional());

const optDate = z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.coerce.date().optional());

// --- schema de atualização do perfil --- //
const updateProfileSchema = z.object({
  displayName: optStr(2, 60),
  headline: optStrMax(120),
  bio: optStrMax(2000),
  avatarUrl: optUrl,
  location: optStrMax(100),
  websiteUrl: optUrl,
  githubUrl: optUrl,
  birthDate: optDate, // Date | undefined
});

export async function getUser(req: Request, res: Response) {
  const id = BigInt(req.params.id);
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      skills: { include: { skill: true } },
      // experiences: true, // <- habilite quando o modelo existir no Prisma
    },
  });
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  return res.json({ user });
}

export async function suggestedPeople(req: any, res: any) {
  const userId: bigint = req.user.id;

  // 1) pegar minhas skills
  const mySkills = await prisma.userSkill.findMany({
    where: { userId },
    select: { skillId: true },
  });
  const mySkillIds = mySkills.map((s) => s.skillId);
  if (mySkillIds.length === 0) {
    return res.json({ users: [] }); // sem skills => sem sugestões (ou poderíamos sugerir aleatório)
  }

  // 2) candidatos: usuários que tenham ao menos 1 skill em comum (exclui o próprio usuário)
  const candidates = await prisma.user.findMany({
    where: {
      id: { not: userId },
      skills: { some: { skillId: { in: mySkillIds } } },
      isActive: true,
    },
    include: {
      profile: true,
      skills: { include: { skill: true } },
    },
    take: 30, // pega um pool maior e depois ordena por score
  });

  // 3) calcular score = nº de skills em comum; ordenar desc e cortar no limit
  const scored = candidates
    .map((u) => {
      const overlap = u.skills.filter((us) => mySkillIds.includes(us.skillId)).map((us) => us.skill.name);

      return {
        id: u.id,
        email: u.email,
        profile: u.profile,
        headline: u.profile?.headline ?? null,
        skills: u.skills,
        overlap,
        overlapCount: overlap.length,
      };
    })
    .filter((u) => u.overlapCount > 0)
    .sort((a, b) => b.overlapCount - a.overlapCount);

  const limit = Math.min(Number(req.query.limit ?? 6), 20);
  return res.json({ users: scored.slice(0, limit) });
}

export async function updateMyProfile(req: Request, res: Response) {
  try {
    const body = updateProfileSchema.parse(req.body);
    // importaria AuthedRequest pra tipar certinho, mas mantendo seu padrão:
    // @ts-ignore (middleware injeta user)
    const userId: bigint = req.user.id;

    // vamos verificar se já existe profile; se não, garantimos displayName na criação
    const existing = await prisma.userProfile.findUnique({ where: { userId } });

    const dataToCreateOrUpdate: any = {
      displayName: existing ? body.displayName : body.displayName ?? '',
      headline: body.headline,
      bio: body.bio,
      avatarUrl: body.avatarUrl,
      location: body.location,
      websiteUrl: body.websiteUrl,
      githubUrl: body.githubUrl,
      birthDate: body.birthDate,
    };

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        profile: {
          upsert: {
            create: dataToCreateOrUpdate,
            update: dataToCreateOrUpdate,
          },
        },
      },
      include: { profile: true },
    });

    return res.json({ user: updated });
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ message: 'Dados inválidos', details: err.issues });
    }
    if (err?.code === 'P2000') {
      return res.status(400).json({ message: 'Um dos campos ultrapassa o limite permitido (URL muito longa).' });
    }
    console.error('[updateMyProfile] error:', err);
    return res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
}
