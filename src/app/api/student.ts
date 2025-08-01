"use server";

import { prisma } from "@/server/db/prisma";

export async function getStudentCount() {
  return await prisma.siswa.count();
}

export async function getRecentStudents(limit = 5) {
  return await prisma.siswa.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getStudentsByClass(kelasId: string) {
  return await prisma.siswaKelas.findMany({
    where: { kelasId },
    include: { Siswa: true },
  });
}

export async function getStudentDetails(userId: string) {
  return null;
}
