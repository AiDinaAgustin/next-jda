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
import { getSubjectById, updateSubject } from "@/app/api/subject";
import { useRouter } from "next/navigation";

// Define the form schema with validation
const formSchema = z.object({
  namaMapel: z.string().min(1, "Nama mata pelajaran wajib diisi"),
  kodeMapel: z.string().min(1, "Kode mata pelajaran wajib diisi"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditSubjectButtonProps {
  subjectId: string;
}

export function EditSubjectButton({ subjectId }: EditSubjectButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      namaMapel: "",
      kodeMapel: "",
    },
  });

  useEffect(() => {
    const fetchSubjectData = async () => {
      if (!open) return;

      try {
        setIsLoading(true);
        const result = await getSubjectById(subjectId);

        if (result.success && result.data) {
          form.reset({
            namaMapel: result.data.namaMapel || "",
            kodeMapel: result.data.kodeMapel || "",
          });
        } else {
          setError(result.error || "Gagal mengambil data mata pelajaran");
        }
      } catch (err) {
        console.error("Error fetching subject data:", err);
        setError("Terjadi kesalahan saat mengambil data mata pelajaran");
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchSubjectData();
    }
  }, [open, subjectId, form]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateSubject(subjectId, {
        namaMapel: values.namaMapel,
        kodeMapel: values.kodeMapel,
      });

      if (result.success) {
        setOpen(false);
        router.refresh(); // Refresh page to show updated data
      } else {
        setError(result.error || "Gagal memperbarui mata pelajaran");
      }
    } catch (err) {
      console.error("Error updating subject:", err);
      setError("Terjadi kesalahan saat memperbarui mata pelajaran");
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
          <DialogTitle>Edit Mata Pelajaran</DialogTitle>
          <DialogDescription>
            Perbarui informasi mata pelajaran
          </DialogDescription>
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
              name="namaMapel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Mata Pelajaran</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama mata pelajaran"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kodeMapel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Mata Pelajaran</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan kode mata pelajaran"
                      {...field}
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
