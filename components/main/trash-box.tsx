"use client";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SearchIcon, Trash, UndoIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { LoaderIcon } from "../loader-icon";
import { ConfirmModal } from "../modals/confirm-modal";

export const TrashBox = () => {
  const router = useRouter();
  const params = useParams();
  const documents = useQuery(api.documents.getArchived);
  const restore = useMutation(api.documents.restore);
  const remove = useMutation(api.documents.remove);

  const [search, setSearch] = useState("");

  const filteredDocuments = documents?.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase()),
  );

  const onClick = (docId: string) => {
    router.push(`/documents/${docId}`);
  };

  const onRestore = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    docId: Id<"documents">,
  ) => {
    e.stopPropagation();
    const promise = restore({ id: docId });
    toast.promise(promise, {
      loading: "Restoring...",
      success: "Document Restored!",
      error: "Failed to restore document.",
    });
  };

  const onRemove = (docId: Id<"documents">) => {
    const promise = remove({ id: docId });
    toast.promise(promise, {
      loading: "Archiving...",
      success: "Document Archived!",
      error: "Failed to archive document.",
    });

    if (params.id === docId) {
      router.push("/documents");
    }
  };

  if (documents === undefined) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <LoaderIcon strokeWidth={2} className="animate-spin" size={16} />
      </div>
    );
  }

  return (
    <div className="text-sm ">
      <div className="flex items-center gap-x-1 p-2 border-b">
        <HugeiconsIcon icon={SearchIcon} className="w-4 h-4" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by title..."
          className="h-7 px-2 focus:ring-transparent bg-secondary"
        />
      </div>
      <div className="mt-2 px-1 pb-1">
        <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
          No documents found.
        </p>
        {filteredDocuments?.map((doc) => (
          <div
            key={doc._id}
            role="button"
            onClick={() => onClick(doc._id)}
            className="cursor-pointer p-1 pl-2 text-sm rounded-sm w-full hover:bg-primary/5 flex items-center text-primary justify-between"
          >
            <span className="truncate">{doc.title}</span>
            <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
              <div
                onClick={(e) => onRestore(e, doc._id)}
                role="button"
                className="rounded-sm p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <HugeiconsIcon
                  className="w-4 h-4 text-muted-foreground"
                  icon={UndoIcon}
                />
              </div>
              <ConfirmModal
                onConfirm={() => onRemove(doc._id)}
                title={`Delete "${doc.title}"?`}
                description="This document will be permanently deleted and cannot be recovered."
              >
                <div
                  role="button"
                  className="rounded-sm p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <HugeiconsIcon
                    className="w-4 h-4 text-muted-foreground"
                    icon={Trash}
                  />
                </div>
              </ConfirmModal>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
