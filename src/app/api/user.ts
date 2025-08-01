"use server";

import { prisma } from "@/server/db/prisma";
import { randomUUID } from "crypto";
import { Role } from "@prisma/client";
import { hash } from "bcrypt";

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { username: "asc" },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        Guru: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });
    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Gagal mengambil data pengguna" };
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        Guru: true,
      },
    });

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, error: "Gagal mengambil data pengguna" };
  }
}

export async function getUserByUsername(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching user by username:", error);
    return { success: false, error: "Gagal mengambil data pengguna" };
  }
}

export async function getUsersByRole(role: Role) {
  try {
    const users = await prisma.user.findMany({
      where: { role },
      orderBy: { username: "asc" },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        Guru:
          role === "guru"
            ? {
                select: {
                  id: true,
                  nama: true,
                },
              }
            : undefined,
      },
    });
    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching users by role:", error);
    return {
      success: false,
      error: "Gagal mengambil data pengguna berdasarkan role",
    };
  }
}

export async function createUser(data: {
  username: string;
  password: string;
  role: Role;
}) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Username sudah digunakan",
      };
    }

    // Hash password
    const hashedPassword = await hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        username: data.username,
        password: hashedPassword,
        role: data.role,
        updatedAt: new Date(),
      },
    });

    // Remove password from returned data
    const { password, ...userWithoutPassword } = user;

    return { success: true, data: userWithoutPassword };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Gagal membuat pengguna baru" };
  }
}

export async function updateUser(
  id: string,
  data: {
    username?: string;
    password?: string;
    role?: Role;
  },
) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return { success: false, error: "Pengguna tidak ditemukan" };
    }

    if (data.username && data.username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (usernameExists) {
        return {
          success: false,
          error: "Username sudah digunakan",
        };
      }
    }

    // Hash password if provided
    let hashedPassword;
    if (data.password) {
      hashedPassword = await hash(data.password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        username: data.username,
        password: hashedPassword,
        role: data.role,
        updatedAt: new Date(),
      },
    });

    // Remove password from returned data
    const { password, ...userWithoutPassword } = user;

    return { success: true, data: userWithoutPassword };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Gagal memperbarui pengguna" };
  }
}

export async function deleteUser(id: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        Guru: true,
      },
    });

    if (!existingUser) {
      return { success: false, error: "Pengguna tidak ditemukan" };
    }

    // Check if user has associated guru profile
    if (existingUser.Guru) {
      return {
        success: false,
        error:
          "Tidak dapat menghapus pengguna yang memiliki profil guru terkait",
      };
    }

    await prisma.user.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Gagal menghapus pengguna" };
  }
}

export async function getUserForAuth(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting user for auth:", error);
    return null;
  }
}
