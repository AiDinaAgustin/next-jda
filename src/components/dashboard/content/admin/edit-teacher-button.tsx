"use client";

import { useState, useEffect } from "react";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getTeacherById, updateTeacher } from "@/app/api/teacher";
import { useRouter } from "next/navigation";

// Define the form schema with improved validation
const formSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  nip: z
    .string()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: "NIP hanya boleh berisi angka",
    }),
  alamat: z.string().optional(),
  noHp: z
    .string()
    .optional()
    .refine((val) => !val || /^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(val), {
      message: "Format nomor HP tidak valid",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTeacherButtonProps {
  teacherId: string;
}

export function EditTeacherButton({ teacherId }: EditTeacherButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: "",
      nip: "",
      alamat: "",
      noHp: "",
    },
  });

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!open) return;

      try {
        setIsLoading(true);
        const result = await getTeacherById(teacherId);

        if (result.success && result.data) {
          form.reset({
            nama: result.data.nama || "",
            nip: result.data.nip || "",
            alamat: result.data.alamat || "",
            noHp: result.data.noHp || "",
          });
        } else {
          setError(result.error || "Gagal mengambil data guru");
        }
      } catch (err) {
        console.error("Error fetching teacher data:", err);
        setError("Terjadi kesalahan saat mengambil data guru");
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchTeacherData();
    }
  }, [open, teacherId, form]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateTeacher(teacherId, {
        nama: values.nama,
        nip: values.nip || undefined,
        alamat: values.alamat || undefined,
        noHp: values.noHp || undefined,
      });

      if (result.success) {
        setOpen(false);
        router.refresh(); // Refresh page to show updated data
      } else {
        setError(result.error || "Gagal memperbarui profil guru");
      }
    } catch (err) {
      console.error("Error updating teacher:", err);
      setError("Terjadi kesalahan saat memperbarui profil guru");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => setOpen(true)}
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profil Guru</DialogTitle>
          <DialogDescription>Perbarui informasi profil guru</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama lengkap"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIP</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan NIP (hanya angka)"
                      {...field}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alamat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan alamat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="noHp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. HP</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: 081234567890"
                      {...field}
                      type="tel"
                      inputMode="tel"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
