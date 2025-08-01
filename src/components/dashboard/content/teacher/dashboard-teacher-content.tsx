import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, GraduationCapIcon, UsersIcon } from "lucide-react";
import { getTeacherByUserId } from "@/app/api/teacher";

interface DashboardTeacherContentProps {
  userId: string;
}

export async function DashboardTeacherContent({
  userId,
}: DashboardTeacherContentProps) {
  const teacherData = await getTeacherByUserId(userId);

  if (!teacherData) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-md border border-dashed">
        <p className="text-muted-foreground">Data guru tidak ditemukan</p>
      </div>
    );
  }

  const classCount = teacherData.JadwalPelajaran.length;
  const walikelas =
    teacherData.Kelas.length > 0 ? teacherData.Kelas[0].namaKelas : "-";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Jadwal Mengajar</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{classCount} Kelas</div>
          <p className="text-xs text-muted-foreground">Semester aktif</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Wali Kelas</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{walikelas}</div>
          <p className="text-xs text-muted-foreground">
            {walikelas !== "-"
              ? "Aktif sebagai wali kelas"
              : "Tidak menjadi wali kelas"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Profil</CardTitle>
          <GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teacherData.nama}</div>
          <p className="text-xs text-muted-foreground">
            {teacherData.nip || "NIP belum diatur"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
