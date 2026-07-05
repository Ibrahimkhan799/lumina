"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
  ChevronDown,
  ChevronRight,
  Ellipsis,
  PlusSignIcon,
  Trash,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { DocumentIcon } from "../document-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Skeleton } from "../ui/skeleton";

interface ItemProps {
  label: React.ReactNode;
  icon: IconSvgElement;
  onClick?: () => void;
  id?: Id<"documents">;
  documentIcon?: string;
  active?: boolean;
  expanded?: boolean;
  isSearch?: boolean;
  level?: number;
  onExpand?: () => void;
}

export const Item = ({
  label,
  icon,
  onClick,
  id,
  level = 0,
  onExpand,
  expanded,
  active,
  documentIcon,
  isSearch,
}: ItemProps) => {
  const ChevronIcon = expanded ? ChevronDown : ChevronRight;
  const create = useMutation(api.documents.create);
  const archive = useMutation(api.documents.archive);
  const router = useRouter();
  const { user } = useUser();

  const onArchive = () => {
    if (!id) return;
    const promise = archive({ id }).then(() => router.push("/documents"));

    toast.promise(promise, {
      loading: "Archiving...",
      success: "Document archived!",
      error: "Failed to archive document.",
    });
  };

  const handleExpand = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onExpand?.();
  };

  const onCreate = () => {
    if (!id) return;

    const promise = create({ parentDocumentId: id, title: "Untitled" }).then(
      (docId) => {
        if (!expanded) onExpand?.();
        router.push(`/documents/${docId}`);
      },
    );

    toast.promise(promise, {
      loading: "Creating...",
      success: "Document created!",
      error: "Failed to create document.",
    });
  };

  return (
    <div
      onClick={onClick}
      role="button"
      className={cn(
        "select-none cursor-pointer group min-h-6.75 text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium",
        active && "bg-primary/5 text-primary",
      )}
      style={{ paddingLeft: level ? `${level * 12 + 12}px` : "12px" }}
    >
      {!!id && (
        <div
          role="button"
          className="h-full rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 mr-1"
          onClick={handleExpand}
        >
          <HugeiconsIcon
            icon={ChevronIcon}
            className="shrink-0 h-4 w-4 text-muted-foreground/50"
          />
        </div>
      )}
      {documentIcon ? (
        <div className="shrink-0 mr-2 text-[18px]">
          <DocumentIcon icon={documentIcon} size={18} />
        </div>
      ) : (
        <HugeiconsIcon
          strokeWidth={2}
          icon={icon}
          className="shrink-0 h-4.5 w-4.5 mr-2 text-muted-foreground"
        />
      )}
      <span className="truncate">{label}</span>

      {isSearch && (
        <kbd className="ml-auto pointer-events-none inline-flex items-center h-5 select-none gap-1 rounded border bg-muted px-1.5 font-code text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-[9px]">⌘</span>K
        </kbd>
      )}
      {!!id && (
        <div
          className="ml-auto flex items-center gap-x-2"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                role="button"
                className="p-0.5 opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={Ellipsis}
                  className="h-4 w-4 text-muted-foreground"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-60"
              align="start"
              side="right"
              forceMount
            >
              <DropdownMenuItem onClick={onArchive}>
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={Trash}
                  className="h-4 w-4 mr-0.5"
                />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="text-xs text-muted-foreground p-2">
                Last edited by: {user?.fullName}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <div
            role="button"
            onClick={onCreate}
            className="p-0.5 opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <HugeiconsIcon
              strokeWidth={2}
              icon={PlusSignIcon}
              className="h-4 w-4 text-muted-foreground"
            />
          </div>
        </div>
      )}
    </div>
  );
};

Item.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
  return (
    <div
      style={{ paddingLeft: level ? `${level * 12 + 25}px` : "12px" }}
      className="flex gap-x-2 py-0.75"
    >
      <Skeleton className="h-4 w-4 bg-primary/5" />
      <Skeleton className="h-4 w-[30%] bg-primary/5" />
    </div>
  );
};
