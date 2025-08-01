"use client";

import { useState } from "react";
import { PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
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
import { createSubject } from "@/app/api/subject";
import { useRouter } from "next/navigation";

// Define the form schema with validation
const formSchema = z.object({
  namaMapel: z.string().min(1, "Nama mata pelajaran wajib diisi"),
  kodeMapel: z.string().min(1, "Kode mata pelajaran wajib diisi"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateSubjectButton() {
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

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createSubject({
        namaMapel: values.namaMapel,
        kodeMapel: values.kodeMapel,
      });

      if (result.success) {
        setOpen(false);
        form.reset();
        router.refresh(); // Refresh page to show updated data
      } else {
        setError(result.error || "Gagal membuat mata pelajaran baru");
      }
    } catch (err) {
      console.error("Error creating subject:", err);
      setError("Terjadi kesalahan saat membuat mata pelajaran baru");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Tambah Mata Pelajaran
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Mata Pelajaran</DialogTitle>
          <DialogDescription>
            Buat mata pelajaran baru untuk sistem
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
