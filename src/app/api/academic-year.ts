"use server";

import { prisma } from "@/server/db/prisma";
import { randomUUID } from "crypto";

export async function getAllAcademicYears() {
  try {
    const academicYears = await prisma.tahunAjaran.findMany({
      orderBy: { tahun: "desc" },
    });
    return { success: true, data: academicYears };
  } catch (error) {
    console.error("Error fetching academic years:", error);
    return { success: false, error: "Gagal mengambil data tahun ajaran" };
  }
}

export async function getActiveAcademicYear() {
  try {
    const activeYear = await prisma.tahunAjaran.findFirst({
      where: { isAktif: true },
    });
    return { success: true, data: activeYear };
  } catch (error) {
    console.error("Error fetching active academic year:", error);
    return { success: false, error: "Gagal mengambil tahun ajaran aktif" };
  }
}

export async function getAcademicYearById(id: string) {
  try {
    const academicYear = await prisma.tahunAjaran.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            Kelas: true,
            Nilai: true,
            SiswaKelas: true,
          },
        },
      },
    });

    if (!academicYear) {
      return { success: false, error: "Tahun ajaran tidak ditemukan" };
    }

    return { success: true, data: academicYear };
  } catch (error) {
    console.error("Error fetching academic year:", error);
    return { success: false, error: "Gagal mengambil data tahun ajaran" };
  }
}

export async function createAcademicYear(data: {
  tahun: string;
  isAktif?: boolean;
}) {
  try {
    const existingYear = await prisma.tahunAjaran.findUnique({
      where: { tahun: data.tahun },
    });

    if (existingYear) {
      return {
        success: false,
        error: "Tahun ajaran dengan periode ini sudah ada",
      };
    }

    if (data.isAktif) {
      await prisma.tahunAjaran.updateMany({
        where: { isAktif: true },
        data: { isAktif: false, updatedAt: new Date() },
      });
    }

    const academicYear = await prisma.tahunAjaran.create({
      data: {
        id: randomUUID(),
        tahun: data.tahun,
        isAktif: data.isAktif || false,
        updatedAt: new Date(),
      },
    });

    return { success: true, data: academicYear };
  } catch (error) {
    console.error("Error creating academic year:", error);
    return { success: false, error: "Gagal membuat tahun ajaran baru" };
  }
}

export async function updateAcademicYear(
  id: string,
  data: { tahun?: string; isAktif?: boolean },
) {
  try {
    const existingYear = await prisma.tahunAjaran.findUnique({
      where: { id },
    });

    if (!existingYear) {
      return { success: false, error: "Tahun ajaran tidak ditemukan" };
    }

    if (data.tahun && data.tahun !== existingYear.tahun) {
      const yearExists = await prisma.tahunAjaran.findUnique({
        where: { tahun: data.tahun },
      });

      if (yearExists) {
        return {
          success: false,
          error: "Tahun ajaran dengan periode ini sudah ada",
        };
      }
    }

    if (data.isAktif && !existingYear.isAktif) {
      await prisma.tahunAjaran.updateMany({
        where: { isAktif: true },
        data: { isAktif: false, updatedAt: new Date() },
      });
    }

    const academicYear = await prisma.tahunAjaran.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return { success: true, data: academicYear };
  } catch (error) {
    console.error("Error updating academic year:", error);
    return { success: false, error: "Gagal memperbarui tahun ajaran" };
  }
}

export async function setActiveAcademicYear(id: string) {
  try {
    const existingYear = await prisma.tahunAjaran.findUnique({
      where: { id },
    });

    if (!existingYear) {
      return { success: false, error: "Tahun ajaran tidak ditemukan" };
    }

    await prisma.tahunAjaran.updateMany({
      data: { isAktif: false, updatedAt: new Date() },
    });

    const academicYear = await prisma.tahunAjaran.update({
      where: { id },
      data: { isAktif: true, updatedAt: new Date() },
    });

    return { success: true, data: academicYear };
  } catch (error) {
    console.error("Error setting active academic year:", error);
    return { success: false, error: "Gagal mengatur tahun ajaran aktif" };
  }
}

export async function deleteAcademicYear(id: string) {
  try {
    const dependencies = await prisma.$transaction([
      prisma.kelas.count({ where: { tahunAjaranId: id } }),
      prisma.nilai.count({ where: { tahunAjaranId: id } }),
      prisma.siswaKelas.count({ where: { tahunAjaranId: id } }),
    ]);

    if (dependencies.some((count) => count > 0)) {
      return {
        success: false,
        error: "Tidak dapat menghapus tahun ajaran yang memiliki data terkait",
      };
    }

    const existingYear = await prisma.tahunAjaran.findUnique({
      where: { id },
    });

    if (!existingYear) {
      return { success: false, error: "Tahun ajaran tidak ditemukan" };
    }

    await prisma.tahunAjaran.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting academic year:", error);
    return { success: false, error: "Gagal menghapus tahun ajaran" };
  }
}
