import { getAllTeachers } from "@/app/api/teacher";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { DeleteTeacherButton } from "@/components/dashboard/content/admin/teacher/delete-teacher-button";
import { EditTeacherButton } from "@/components/dashboard/content/admin/teacher/edit-teacher-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTeacherButton } from "@/components/dashboard/content/admin/teacher/create-teacher-button";

export async function TableTeacher() {
  const teachersResult = await getAllTeachers();
  const teachers = teachersResult.success ? teachersResult.data : [];

  return (
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
                  <TableCell className="font-medium">{teacher.nama}</TableCell>
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
  );
}
