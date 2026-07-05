"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DocumentsPage() {
  const { user } = useUser();
  const router = useRouter();
  const create = useMutation(api.documents.create);

  const onCreate = () => {
    const promise = create({ title: "Untitled" }).then((id) =>
      router.push(`/documents/${id}`),
    );

    toast.promise(promise, {
      loading: "Creating...",
      success: "Document created!",
      error: "Failed to create document.",
    });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Image
        src="assets/empty.svg"
        alt="Empty State Illustration"
        height={300}
        width={300}
        className="dark:hidden"
      />
      <Image
        src="assets/empty-dark.svg"
        alt="Dark Empty State Illustration"
        height={300}
        width={300}
        className="hidden dark:block"
      />
      <h2 className="text-xl font-medium mt-3">
        Welcome to Lumina, {user?.firstName}
      </h2>
      <Button onClick={onCreate} size="lg">
        <HugeiconsIcon
          icon={PlusSignIcon}
          className="h-4 w-4 mr-1 text-background"
          strokeWidth={2}
        />
        Create a note
      </Button>
    </div>
  );
}
