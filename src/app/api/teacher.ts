"use server";

import { prisma } from "@/server/db/prisma";
import { randomUUID } from "crypto";

export async function getTeacherCount() {
  return await prisma.guru.count();
}

export async function getRecentTeachers(limit = 5) {
  return await prisma.guru.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getTeacherByUserId(userId: string) {
  return await prisma.guru.findUnique({
    where: { userId },
    include: {
      Kelas: true,
      JadwalPelajaran: {
        include: {
          MataPelajaran: true,
          Kelas: true,
        },
      },
    },
  });
}

export async function getAllTeachers() {
  try {
    const teachers = await prisma.guru.findMany({
      orderBy: { nama: "asc" },
      include: {
        User: {
          select: {
            username: true,
            role: true,
          },
        },
      },
    });
    return { success: true, data: teachers };
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return { success: false, error: "Gagal mengambil data guru" };
  }
}

export async function getTeacherById(id: string) {
  try {
    const teacher = await prisma.guru.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            username: true,
            role: true,
          },
        },
      },
    });

    if (!teacher) {
      return { success: false, error: "Guru tidak ditemukan" };
    }

    return { success: true, data: teacher };
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return { success: false, error: "Gagal mengambil data guru" };
  }
}

export async function createTeacher(data: {
  userId: string;
  nama: string;
  nip?: string;
  alamat?: string;
  noHp?: string;
}) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      return { success: false, error: "User tidak ditemukan" };
    }

    if (user.role !== "guru") {
      return { success: false, error: "User bukan seorang guru" };
    }

    const existingTeacher = await prisma.guru.findUnique({
      where: { userId: data.userId },
    });

    if (existingTeacher) {
      return { success: false, error: "Profil guru sudah ada untuk user ini" };
    }

    const teacher = await prisma.guru.create({
      data: {
        id: randomUUID(),
        userId: data.userId,
        nama: data.nama,
        nip: data.nip || null,
        alamat: data.alamat || null,
        noHp: data.noHp || null,
        updatedAt: new Date(),
      },
    });

    return { success: true, data: teacher };
  } catch (error) {
    console.error("Error creating teacher:", error);
    return { success: false, error: "Gagal membuat data guru" };
  }
}

export async function updateTeacher(
  id: string,
  data: {
    nama?: string;
    nip?: string;
    alamat?: string;
    noHp?: string;
  },
) {
  try {
    const existingTeacher = await prisma.guru.findUnique({
      where: { id },
    });

    if (!existingTeacher) {
      return { success: false, error: "Guru tidak ditemukan" };
    }

    const teacher = await prisma.guru.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return { success: true, data: teacher };
  } catch (error) {
    console.error("Error updating teacher:", error);
    return { success: false, error: "Gagal memperbarui data guru" };
  }
}

export async function deleteTeacher(id: string) {
  try {
    const existingTeacher = await prisma.guru.findUnique({
      where: { id },
      include: {
        Kelas: true,
        JadwalPelajaran: true,
        Nilai: true,
      },
    });

    if (!existingTeacher) {
      return { success: false, error: "Guru tidak ditemukan" };
    }

    if (existingTeacher.Kelas.length > 0) {
      return {
        success: false,
        error: "Tidak dapat menghapus guru yang menjadi wali kelas",
      };
    }

    if (existingTeacher.JadwalPelajaran.length > 0) {
      return {
        success: false,
        error: "Tidak dapat menghapus guru yang memiliki jadwal mengajar",
      };
    }

    if (existingTeacher.Nilai.length > 0) {
      return {
        success: false,
        error: "Tidak dapat menghapus guru yang memiliki data nilai",
      };
    }

    await prisma.guru.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return { success: false, error: "Gagal menghapus data guru" };
  }
}
