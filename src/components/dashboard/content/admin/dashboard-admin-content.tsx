import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCapIcon, UsersIcon, BookOpenIcon } from "lucide-react";
import { getStudentCount } from "@/app/api/student";
import { getTeacherCount, getAllTeachers } from "@/app/api/teacher";
import { getClassCount } from "@/app/api/class";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { DeleteTeacherButton } from "@/components/dashboard/content/admin/delete-teacher-button";
import { CreateTeacherButton } from "@/components/dashboard/content/admin/create-teacher-button";
import { EditTeacherButton } from "@/components/dashboard/content/admin/edit-teacher-button";

export async function DashboardAdminContent() {
  const studentCount = await getStudentCount();
  const teacherCount = await getTeacherCount();
  const classCount = await getClassCount();
  const teachersResult = await getAllTeachers();
  const teachers = teachersResult.success ? teachersResult.data : [];

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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Guru</CardTitle>
          <CreateTeacherButton />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>NIP</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>No HP</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(teachers || []).length > 0 ? (
                (teachers || []).map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">
                      {teacher.nama}
                    </TableCell>
                    <TableCell>{teacher.nip || "-"}</TableCell>
                    <TableCell>{teacher.User?.username || "-"}</TableCell>
                    <TableCell>{teacher.alamat || "-"}</TableCell>
                    <TableCell>{teacher.noHp || "-"}</TableCell>

                    <TableCell>
                      <EditTeacherButton teacherId={teacher.id} />

                      <DeleteTeacherButton
                        teacherId={teacher.id}
                        teacherName={teacher.nama}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Tidak ada data guru
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
