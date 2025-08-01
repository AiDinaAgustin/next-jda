import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { LogoutButton } from "@/components/auth/logout-button";
import { DashboardAdminContent } from "@/components/dashboard/content/admin/dashboard-admin-content";
import { DashboardTeacherContent } from "@/components/dashboard/content/teacher/dashboard-teacher-content";
import { DashboardStudentContent } from "@/components/dashboard/content/student/dashboard-student-content";

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(
        process.env.JWT_SECRET || "fallback_secret_please_set_env_variable",
      ),
    );

    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as "admin" | "guru" | "siswa",
    };
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

export default async function DashboardPage() {
  const user = await getUserFromToken();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang, {user?.username || "User"}! ({user?.role || "user"})
          </p>
        </div>
        <div>
          <LogoutButton />
        </div>
      </div>

      {user?.role === "admin" && <DashboardAdminContent />}
      {user?.role === "guru" && (
        <DashboardTeacherContent userId={user.userId} />
      )}
      {user?.role === "siswa" && (
        <DashboardStudentContent userId={user.userId} />
      )}

      {!user?.role && (
        <div className="flex h-40 w-full items-center justify-center rounded-md border border-dashed">
          <p className="text-muted-foreground">Role tidak terdeteksi</p>
        </div>
      )}
    </div>
  );
}
