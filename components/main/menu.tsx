"use client";

import { Id } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Ellipsis,
  Trash
} from "@hugeicons/core-free-icons";
import { Skeleton } from "../ui/skeleton";

type MenuProps = {
  documentId: Id<"documents">;
};

const Menu = ({ documentId }: MenuProps) => {
  const router = useRouter();
  const { user } = useUser();

  const archive = useMutation(api.documents.archive);

  const onArchive = () => {
    const promise = archive({ id: documentId });
    toast.promise(promise, {
      loading: "Archiving...",
      success: "Document archived successfully",
      error: "Failed to archive document",
    });

    router.push("/documents");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="sm" variant="ghost">
          <HugeiconsIcon
            icon={Ellipsis}
            strokeWidth={2}
            className="w-4 h-4 text-muted-foreground"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" alignOffset={8} forceMount>
        <DropdownMenuItem onClick={onArchive}>
          <HugeiconsIcon
            icon={Trash}
            className="w-4 h-4"
          />
          Archive
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="text-xs text-muted-foreground p-2">
          Last edited by: {user?.fullName}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

Menu.Skeleton = function MenuSkeleton() {
  return (
    <Skeleton className="h-5 w-5" />
  ) ;
};

export default Menu;
