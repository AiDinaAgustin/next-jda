"use server";

import { prisma } from "@/server/db/prisma";

export async function getClassCount() {
  return await prisma.kelas.count();
}

export async function getActiveClasses() {
  const activeTahunAjaran = await prisma.tahunAjaran.findFirst({
    where: { isAktif: true },
  });

  if (!activeTahunAjaran) {
    return [];
  }

  return await prisma.kelas.findMany({
    where: { tahunAjaranId: activeTahunAjaran.id },
    include: {
      Guru: true,
      _count: {
        select: { SiswaKelas: true },
      },
    },
  });
}

export async function getClassesByLevel(tingkat: number) {
  const activeTahunAjaran = await prisma.tahunAjaran.findFirst({
    where: { isAktif: true },
  });

  if (!activeTahunAjaran) {
    return [];
  }

  return await prisma.kelas.findMany({
    where: {
      tahunAjaranId: activeTahunAjaran.id,
      tingkat,
    },
    include: {
      Guru: true,
      _count: {
        select: { SiswaKelas: true },
      },
    },
  });
}
