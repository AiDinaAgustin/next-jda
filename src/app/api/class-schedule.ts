"use server";

import { prisma } from "@/server/db/prisma";
import { Hari } from "@prisma/client";
import { randomUUID } from "crypto";

export async function getAllClassSchedules() {
  try {
    const schedules = await prisma.jadwalPelajaran.findMany({
      include: {
        Guru: true,
        Kelas: true,
        MataPelajaran: true,
      },
      orderBy: { hari: "asc" },
    });

    return { success: true, data: schedules };
  } catch (error) {
    console.error("Error fetching class schedules:", error);
    return { success: false, error: "Gagal mengambil data jadwal pelajaran" };
  }
}

export async function getClassSchedulesByTeacher(guruId: string) {
  try {
    const schedules = await prisma.jadwalPelajaran.findMany({
      where: { guruId },
      include: {
        Kelas: true,
        MataPelajaran: true,
      },
      orderBy: { hari: "asc" },
    });

    return { success: true, data: schedules };
  } catch (error) {
    console.error("Error fetching teacher schedules:", error);
    return { success: false, error: "Gagal mengambil jadwal guru" };
  }
}

export async function getClassSchedulesByClass(kelasId: string) {
  try {
    const schedules = await prisma.jadwalPelajaran.findMany({
      where: { kelasId },
      include: {
        Guru: true,
        MataPelajaran: true,
      },
      orderBy: { hari: "asc" },
    });

    return { success: true, data: schedules };
  } catch (error) {
    console.error("Error fetching class schedules:", error);
    return { success: false, error: "Gagal mengambil jadwal kelas" };
  }
}

export async function getClassSchedulesByDay(hari: Hari) {
  try {
    const schedules = await prisma.jadwalPelajaran.findMany({
      where: { hari },
      include: {
        Guru: true,
        Kelas: true,
        MataPelajaran: true,
      },
      orderBy: { jamMulai: "asc" },
    });

    return { success: true, data: schedules };
  } catch (error) {
    console.error("Error fetching day schedules:", error);
    return { success: false, error: "Gagal mengambil jadwal hari" };
  }
}

export async function createClassSchedule(data: {
  guruId: string;
  mapelId: string;
  kelasId: string;
  hari: Hari;
  jamMulai: Date;
  jamSelesai: Date;
}) {
  try {
    const conflictingSchedule = await prisma.jadwalPelajaran.findFirst({
      where: {
        OR: [
          {
            kelasId: data.kelasId,
            hari: data.hari,
            OR: [
              {
                AND: [
                  { jamMulai: { lte: data.jamMulai } },
                  { jamSelesai: { gt: data.jamMulai } },
                ],
              },
              {
                AND: [
                  { jamMulai: { lt: data.jamSelesai } },
                  { jamSelesai: { gte: data.jamSelesai } },
                ],
              },
            ],
          },
          {
            guruId: data.guruId,
            hari: data.hari,
            OR: [
              {
                AND: [
                  { jamMulai: { lte: data.jamMulai } },
                  { jamSelesai: { gt: data.jamMulai } },
                ],
              },
              {
                AND: [
                  { jamMulai: { lt: data.jamSelesai } },
                  { jamSelesai: { gte: data.jamSelesai } },
                ],
              },
            ],
          },
        ],
      },
    });

    if (conflictingSchedule) {
      return {
        success: false,
        error: "Jadwal bertabrakan dengan jadwal yang sudah ada",
      };
    }

    const schedule = await prisma.jadwalPelajaran.create({
      data: {
        id: randomUUID(),
        guruId: data.guruId,
        mapelId: data.mapelId,
        kelasId: data.kelasId,
        hari: data.hari,
        jamMulai: data.jamMulai,
        jamSelesai: data.jamSelesai,
        updatedAt: new Date(),
      },
    });

    return { success: true, data: schedule };
  } catch (error) {
    console.error("Error creating class schedule:", error);
    return { success: false, error: "Gagal membuat jadwal pelajaran" };
  }
}

export async function getClassScheduleById(id: string) {
  try {
    const schedule = await prisma.jadwalPelajaran.findUnique({
      where: { id },
      include: {
        Guru: true,
        Kelas: true,
        MataPelajaran: true,
      },
    });

    if (!schedule) {
      return { success: false, error: "Jadwal tidak ditemukan" };
    }

    return { success: true, data: schedule };
  } catch (error) {
    console.error("Error fetching class schedule:", error);
    return { success: false, error: "Gagal mengambil data jadwal pelajaran" };
  }
}

export async function deleteClassSchedule(id: string) {
  try {
    const attendanceCount = await prisma.absensi.count({
      where: { jadwalId: id },
    });

    if (attendanceCount > 0) {
      return {
        success: false,
        error: "Tidak dapat menghapus jadwal yang memiliki data absensi",
      };
    }

    await prisma.jadwalPelajaran.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting class schedule:", error);
    return { success: false, error: "Gagal menghapus jadwal pelajaran" };
  }
}
