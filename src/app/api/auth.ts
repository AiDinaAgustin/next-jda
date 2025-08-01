"use server";

import { prisma } from "@/server/db/prisma";
import { cookies } from "next/headers";
import { z } from "zod";
import { compare, hash } from "bcrypt";
import { SignJWT } from "jose";
import { randomUUID } from "crypto";

const registerSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    role: z.enum(["admin", "guru", "siswa"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export async function login(formData: LoginFormData) {
  try {
    const validatedFields = loginSchema.safeParse(formData);

    if (!validatedFields.success) {
      return {
        error: "Invalid form data",
        validationErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { username, password } = validatedFields.data;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { error: "Invalid credentials" };
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return { error: "Invalid credentials" };
    }

    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(
        new TextEncoder().encode(
          process.env.JWT_SECRET || "fallback_secret_please_set_env_variable",
        ),
      );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    cookies().set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
    });

    return { success: true, role: user.role };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function register(formData: RegisterFormData) {
  try {
    const validatedFields = registerSchema.safeParse(formData);

    if (!validatedFields.success) {
      return {
        error: "Invalid form data",
        validationErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { username, password, role } = validatedFields.data;

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { error: "Username already exists" };
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        username,
        password: hashedPassword,
        role,
        updatedAt: new Date(),
      },
    });

    return { success: true, role: user.role };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function logout() {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    cookies().delete("token");
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { error: "An unexpected error occurred" };
  }
}
