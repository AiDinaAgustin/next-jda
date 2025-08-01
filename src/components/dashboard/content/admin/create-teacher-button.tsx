"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createTeacher } from "@/app/api/teacher";
import { getAllUsers } from "@/app/api/user";
import { useRouter } from "next/navigation";

// Define the form schema with improved validation
const formSchema = z.object({
  userId: z.string().min(1, "Pilih user"),
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

export function CreateTeacherButton() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      nama: "",
      nip: "",
      alamat: "",
      noHp: "",
    },
  });

  useEffect(() => {
    const fetchGuruUsers = async () => {
      try {
        const result = await getAllUsers();
        console.log("Fetched users:", result);

        if (result.success) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          const filteredUsers = result.data
            .filter((user) => user.role.toLowerCase() === "guru" && !user.Guru)
            .map((user) => ({
              id: user.id,
              username: user.username,
            }));

          console.log("Filtered users:", filteredUsers);
          setUsers(filteredUsers);
        } else {
          setError(result.error || "Gagal mengambil data pengguna");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Terjadi kesalahan saat mengambil data pengguna");
      }
    };

    if (open) {
      fetchGuruUsers();
    }
  }, [open]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createTeacher({
        userId: values.userId,
        nama: values.nama,
        nip: values.nip || undefined,
        alamat: values.alamat || undefined,
        noHp: values.noHp || undefined,
      });

      if (result.success) {
        setOpen(false);
        form.reset();
        router.refresh(); // Refresh page to show updated data
      } else {
        setError(result.error || "Gagal membuat profil guru");
      }
    } catch (err) {
      console.error("Error creating teacher:", err);
      setError("Terjadi kesalahan saat membuat profil guru");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserChange = (userId: string) => {
    // Set the name field to match the selected user's username initially
    const selectedUser = users.find((user) => user.id === userId);
    if (selectedUser) {
      form.setValue("nama", selectedUser.username);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Tambah Guru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Profil Guru</DialogTitle>
          <DialogDescription>
            Buat profil guru untuk user yang memiliki role guru
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
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleUserChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={"w-full"}>
                        <SelectValue placeholder="Pilih user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.username}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Tidak ada user guru yang tersedia
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
