"use server";

import { prisma } from "@/server/db/prisma";
import { randomUUID } from "crypto";

export async function getAllClassStudents() {
  try {
    const classStudents = await prisma.siswaKelas.findMany({
      include: {
        Siswa: true,
        Kelas: true,
        TahunAjaran: true,
      },
    });
    return { success: true, data: classStudents };
  } catch (error) {
    console.error("Error fetching class students:", error);
    return { success: false, error: "Gagal mengambil data siswa kelas" };
  }
}

export async function getStudentsByClass(kelasId: string) {
  try {
    const classStudents = await prisma.siswaKelas.findMany({
      where: { kelasId },
      include: {
        Siswa: true,
      },
    });
    return { success: true, data: classStudents };
  } catch (error) {
    console.error("Error fetching class students:", error);
    return { success: false, error: "Gagal mengambil data siswa di kelas" };
  }
}

export async function getClassesByStudent(siswaId: string) {
  try {
    const studentClasses = await prisma.siswaKelas.findMany({
      where: { siswaId },
      include: {
        Kelas: {
          include: {
            Guru: true,
          },
        },
        TahunAjaran: true,
      },
    });
    return { success: true, data: studentClasses };
  } catch (error) {
    console.error("Error fetching student classes:", error);
    return { success: false, error: "Gagal mengambil data kelas siswa" };
  }
}

export async function addStudentToClass(data: {
  siswaId: string;
  kelasId: string;
  tahunAjaranId: string;
}) {
  try {
    const existingRecord = await prisma.siswaKelas.findFirst({
      where: {
        siswaId: data.siswaId,
        kelasId: data.kelasId,
        tahunAjaranId: data.tahunAjaranId,
      },
    });

    if (existingRecord) {
      return {
        success: false,
        error: "Siswa sudah terdaftar di kelas tersebut",
      };
    }

    const classStudent = await prisma.siswaKelas.create({
      data: {
        id: randomUUID(),
        siswaId: data.siswaId,
        kelasId: data.kelasId,
        tahunAjaranId: data.tahunAjaranId,
        updatedAt: new Date(),
      },
      include: {
        Siswa: true,
        Kelas: true,
      },
    });

    return { success: true, data: classStudent };
  } catch (error) {
    console.error("Error adding student to class:", error);
    return { success: false, error: "Gagal menambahkan siswa ke kelas" };
  }
}

export async function removeStudentFromClass(id: string) {
  try {
    await prisma.siswaKelas.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing student from class:", error);
    return { success: false, error: "Gagal menghapus siswa dari kelas" };
  }
}

export async function getClassStudentsByAcademicYear(tahunAjaranId: string) {
  try {
    const classStudents = await prisma.siswaKelas.findMany({
      where: { tahunAjaranId },
      include: {
        Siswa: true,
        Kelas: true,
      },
    });
    return { success: true, data: classStudents };
  } catch (error) {
    console.error("Error fetching class students by academic year:", error);
    return {
      success: false,
      error: "Gagal mengambil data siswa kelas untuk tahun ajaran",
    };
  }
}

export async function checkStudentInClass(siswaId: string, kelasId: string) {
  try {
    const record = await prisma.siswaKelas.findFirst({
      where: {
        siswaId,
        kelasId,
      },
    });

    return { success: true, data: !!record };
  } catch (error) {
    console.error("Error checking student in class:", error);
    return { success: false, error: "Gagal memeriksa status siswa di kelas" };
  }
}
