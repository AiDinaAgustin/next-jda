"use server";

import { prisma } from "@/server/db/prisma";
import { randomUUID } from "crypto";

export async function getAllSubjects() {
  try {
    const subjects = await prisma.mataPelajaran.findMany({
      orderBy: { namaMapel: "asc" },
    });
    return { success: true, data: subjects };
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return { success: false, error: "Gagal mengambil data mata pelajaran" };
  }
}

export async function getSubjectById(id: string) {
  try {
    const subject = await prisma.mataPelajaran.findUnique({
      where: { id },
      include: {
        JadwalPelajaran: {
          include: {
            Guru: true,
            Kelas: true,
          },
        },
      },
    });

    if (!subject) {
      return { success: false, error: "Mata pelajaran tidak ditemukan" };
    }

    return { success: true, data: subject };
  } catch (error) {
    console.error("Error fetching subject:", error);
    return { success: false, error: "Gagal mengambil data mata pelajaran" };
  }
}

export async function getSubjectByCode(kodeMapel: string) {
  try {
    const subject = await prisma.mataPelajaran.findUnique({
      where: { kodeMapel },
    });

    if (!subject) {
      return { success: false, error: "Mata pelajaran tidak ditemukan" };
    }

    return { success: true, data: subject };
  } catch (error) {
    console.error("Error fetching subject by code:", error);
    return { success: false, error: "Gagal mengambil data mata pelajaran" };
  }
}

export async function createSubject(data: {
  namaMapel: string;
  kodeMapel: string;
}) {
  try {
    const existingSubject = await prisma.mataPelajaran.findUnique({
      where: { kodeMapel: data.kodeMapel },
    });

    if (existingSubject) {
      return {
        success: false,
        error: "Kode mata pelajaran sudah digunakan",
      };
    }

    const subject = await prisma.mataPelajaran.create({
      data: {
        id: randomUUID(),
        namaMapel: data.namaMapel,
        kodeMapel: data.kodeMapel,
        updatedAt: new Date(),
      },
    });

    return { success: true, data: subject };
  } catch (error) {
    console.error("Error creating subject:", error);
    return { success: false, error: "Gagal membuat mata pelajaran baru" };
  }
}

export async function updateSubject(
  id: string,
  data: {
    namaMapel?: string;
    kodeMapel?: string;
  },
) {
  try {
    const existingSubject = await prisma.mataPelajaran.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      return { success: false, error: "Mata pelajaran tidak ditemukan" };
    }

    if (data.kodeMapel && data.kodeMapel !== existingSubject.kodeMapel) {
      const codeExists = await prisma.mataPelajaran.findUnique({
        where: { kodeMapel: data.kodeMapel },
      });

      if (codeExists) {
        return {
          success: false,
          error: "Kode mata pelajaran sudah digunakan",
        };
      }
    }

    const subject = await prisma.mataPelajaran.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return { success: true, data: subject };
  } catch (error) {
    console.error("Error updating subject:", error);
    return { success: false, error: "Gagal memperbarui mata pelajaran" };
  }
}

export async function deleteSubject(id: string) {
  try {
    const scheduleCount = await prisma.jadwalPelajaran.count({
      where: { mapelId: id },
    });

    if (scheduleCount > 0) {
      return {
        success: false,
        error:
          "Tidak dapat menghapus mata pelajaran yang digunakan dalam jadwal",
      };
    }

    const scoreCount = await prisma.nilai.count({
      where: { mapelId: id },
    });

    if (scoreCount > 0) {
      return {
        success: false,
        error: "Tidak dapat menghapus mata pelajaran yang memiliki data nilai",
      };
    }

    await prisma.mataPelajaran.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting subject:", error);
    return { success: false, error: "Gagal menghapus mata pelajaran" };
  }
}
