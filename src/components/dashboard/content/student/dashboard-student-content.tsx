import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, ClipboardListIcon, BookIcon } from "lucide-react";

interface DashboardStudentContentProps {
  userId: string;
}

export async function DashboardStudentContent({
  userId,
}: DashboardStudentContentProps) {
  // This would need to be implemented with the proper relation between User and Siswa
  // For now, showing a placeholder

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Jadwal Hari Ini</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5 Mata Pelajaran</div>
          <p className="text-xs text-muted-foreground">Dimulai 07:00 - 14:30</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tugas Menunggu</CardTitle>
          <BookIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3 Tugas</div>
          <p className="text-xs text-muted-foreground">
            Deadline terdekat: 3 hari lagi
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Nilai Terbaru</CardTitle>
          <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">85.5</div>
          <p className="text-xs text-muted-foreground">Matematika - UTS</p>
        </CardContent>
      </Card>
    </div>
  );
}
