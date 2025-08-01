import { getAllSubjects } from "@/app/api/subject";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateSubjectButton } from "@/components/dashboard/content/admin/subject/create-subject-button";
import { EditSubjectButton } from "@/components/dashboard/content/admin/subject/edit-subject-button";
import { DeleteSubjectButton } from "@/components/dashboard/content/admin/subject/delete-subject-button";

export async function TableSubject() {
  const subjectsResult = await getAllSubjects();
  const subjects = subjectsResult.success ? subjectsResult.data : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Daftar Mata Pelajaran</CardTitle>
        <CreateSubjectButton />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Mata Pelajaran</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(subjects || []).length > 0 ? (
              (subjects || []).map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">
                    {subject.namaMapel}
                  </TableCell>
                  <TableCell>{subject.kodeMapel}</TableCell>
                  <TableCell className="flex space-x-2">
                    <EditSubjectButton subjectId={subject.id} />
                    <DeleteSubjectButton
                      subjectId={subject.id}
                      subjectName={subject.namaMapel}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Tidak ada data mata pelajaran
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
