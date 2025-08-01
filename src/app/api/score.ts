"use server";

import { prisma } from "@/server/db/prisma";
import { JenisNilai, Semester } from "@prisma/client";
import { randomUUID } from "crypto";

export async function getAllScores() {
  try {
    const scores = await prisma.nilai.findMany({
      include: {
        Siswa: true,
        MataPelajaran: true,
        Guru: true,
        TahunAjaran: true,
      },
      orderBy: { tanggalInput: "desc" },
    });
    return { success: true, data: scores };
  } catch (error) {
    console.error("Error fetching scores:", error);
    return { success: false, error: "Gagal mengambil data nilai" };
  }
}

export async function getScoresByStudent(siswaId: string) {
  try {
    const scores = await prisma.nilai.findMany({
      where: { siswaId },
      include: {
        MataPelajaran: true,
        Guru: true,
        TahunAjaran: true,
      },
      orderBy: [
        { tahunAjaranId: "desc" },
        { semester: "asc" },
        { mapelId: "asc" },
      ],
    });
    return { success: true, data: scores };
  } catch (error) {
    console.error("Error fetching student scores:", error);
    return { success: false, error: "Gagal mengambil nilai siswa" };
  }
}

export async function getScoresBySubject(mapelId: string) {
  try {
    const scores = await prisma.nilai.findMany({
      where: { mapelId },
      include: {
        Siswa: true,
        Guru: true,
        TahunAjaran: true,
      },
      orderBy: [
        { tahunAjaranId: "desc" },
        { semester: "asc" },
        { siswaId: "asc" },
      ],
    });
    return { success: true, data: scores };
  } catch (error) {
    console.error("Error fetching subject scores:", error);
    return { success: false, error: "Gagal mengambil nilai mata pelajaran" };
  }
}

export async function getScoresByTeacher(guruId: string) {
  try {
    const scores = await prisma.nilai.findMany({
      where: { guruId },
      include: {
        Siswa: true,
        MataPelajaran: true,
        TahunAjaran: true,
      },
      orderBy: [
        { tahunAjaranId: "desc" },
        { semester: "asc" },
        { mapelId: "asc" },
        { siswaId: "asc" },
      ],
    });
    return { success: true, data: scores };
  } catch (error) {
    console.error("Error fetching teacher scores:", error);
    return { success: false, error: "Gagal mengambil nilai dari guru" };
  }
}

export async function getScoresByClassAndSubject(
  kelasId: string,
  mapelId: string,
  semester: Semester,
  tahunAjaranId: string,
) {
  try {
    const siswaKelas = await prisma.siswaKelas.findMany({
      where: { kelasId },
      select: { siswaId: true },
    });

    const siswaIds = siswaKelas.map((sk) => sk.siswaId);

    const scores = await prisma.nilai.findMany({
      where: {
        siswaId: { in: siswaIds },
        mapelId,
        semester,
        tahunAjaranId,
      },
      include: {
        Siswa: true,
        MataPelajaran: true,
        Guru: true,
      },
      orderBy: [{ jenisNilai: "asc" }, { siswaId: "asc" }],
    });

    return { success: true, data: scores };
  } catch (error) {
    console.error("Error fetching class scores:", error);
    return { success: false, error: "Gagal mengambil nilai kelas" };
  }
}

export async function createScore(data: {
  siswaId: string;
  mapelId: string;
  guruId: string;
  semester: Semester;
  jenisNilai: JenisNilai;
  nilai: number;
  tahunAjaranId: string;
}) {
  try {
    const existingScore = await prisma.nilai.findFirst({
      where: {
        siswaId: data.siswaId,
        mapelId: data.mapelId,
        semester: data.semester,
        jenisNilai: data.jenisNilai,
        tahunAjaranId: data.tahunAjaranId,
      },
    });

    if (existingScore) {
      return {
        success: false,
        error: "Nilai dengan kriteria tersebut sudah ada",
      };
    }

    const score = await prisma.nilai.create({
      data: {
        id: randomUUID(),
        siswaId: data.siswaId,
        mapelId: data.mapelId,
        guruId: data.guruId,
        semester: data.semester,
        jenisNilai: data.jenisNilai,
        nilai: data.nilai,
        tanggalInput: new Date(),
        tahunAjaranId: data.tahunAjaranId,
        updatedAt: new Date(),
      },
    });

    return { success: true, data: score };
  } catch (error) {
    console.error("Error creating score:", error);
    return { success: false, error: "Gagal menyimpan nilai" };
  }
}

export async function updateScore(id: string, data: { nilai: number }) {
  try {
    const score = await prisma.nilai.update({
      where: { id },
      data: {
        nilai: data.nilai,
        updatedAt: new Date(),
      },
    });

    return { success: true, data: score };
  } catch (error) {
    console.error("Error updating score:", error);
    return { success: false, error: "Gagal memperbarui nilai" };
  }
}

export async function deleteScore(id: string) {
  try {
    await prisma.nilai.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting score:", error);
    return { success: false, error: "Gagal menghapus nilai" };
  }
}
