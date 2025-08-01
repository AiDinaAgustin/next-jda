"use server";

import { prisma } from "@/server/db/prisma";
import { randomUUID } from "crypto";
import { StatusAbsensi } from "@prisma/client";

export async function createAttendance(data: {
  siswaId: string;
  jadwalId: string;
  tanggal: Date;
  status: StatusAbsensi;
  keterangan?: string;
}) {
  try {
    const attendance = await prisma.absensi.create({
      data: {
        id: randomUUID(),
        siswaId: data.siswaId,
        jadwalId: data.jadwalId,
        tanggal: data.tanggal,
        status: data.status,
        keterangan: data.keterangan,
        updatedAt: new Date(),
      },
    });

    return { success: true, data: attendance };
  } catch (error) {
    console.error("Error creating attendance:", error);
    return { success: false, error: "Gagal menyimpan data absensi" };
  }
}

export async function getAttendanceByJadwal(jadwalId: string) {
  try {
    const attendances = await prisma.absensi.findMany({
      where: { jadwalId },
      include: {
        Siswa: true,
        JadwalPelajaran: {
          include: {
            MataPelajaran: true,
            Kelas: true,
          },
        },
      },
      orderBy: { tanggal: "desc" },
    });

    return { success: true, data: attendances };
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return { success: false, error: "Gagal mengambil data absensi" };
  }
}

export async function getRecentAttendance(limit = 20) {
  try {
    const attendances = await prisma.absensi.findMany({
      include: {
        Siswa: true,
        JadwalPelajaran: {
          include: {
            MataPelajaran: true,
            Kelas: true,
          },
        },
      },
      orderBy: { tanggal: "desc" },
      take: limit,
    });

    return { success: true, data: attendances };
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return { success: false, error: "Gagal mengambil data absensi" };
  }
}
