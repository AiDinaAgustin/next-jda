import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCapIcon, UsersIcon, BookOpenIcon } from "lucide-react";
import { getStudentCount } from "@/app/api/student";
import { getTeacherCount } from "@/app/api/teacher";
import { getClassCount } from "@/app/api/class";
import { TableTeacher } from "@/components/dashboard/content/admin/teacher/table-teacher";
import { TableSubject } from "@/components/dashboard/content/admin/subject/table-subject";

export async function DashboardAdminContent() {
  const studentCount = await getStudentCount();
  const teacherCount = await getTeacherCount();
  const classCount = await getClassCount();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount}</div>
            <p className="text-xs text-muted-foreground">
              Terdaftar dalam sistem
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Guru</CardTitle>
            <GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherCount}</div>
            <p className="text-xs text-muted-foreground">Aktif mengajar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classCount}</div>
            <p className="text-xs text-muted-foreground">Tahun ajaran aktif</p>
          </CardContent>
        </Card>
      </div>
      <TableTeacher />
      <TableSubject />
    </div>
  );
}
