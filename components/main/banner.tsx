import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { ConfirmModal } from "@/components/modals/confirm-modal";

type BannerProps = {
  documentId: Id<"documents">;
};

export const Banner = ({ documentId }: BannerProps) => {
  const router = useRouter();

  const remove = useMutation(api.documents.remove);
  const restore = useMutation(api.documents.restore);

  const onRemove = () => {
    const promise = remove({ id: documentId });

    toast.promise(promise, {
      loading: "Removing...",
      success: "Document removed!",
      error: "Failed to remove document.",
    });

    router.push("/documents");
  };

  const onRestore = () => {
    const promise = restore({ id: documentId });
    toast.promise(promise, {
      loading: "Restoring...",
      success: "Document restored!",
      error: "Failed to restore document.",
    });
  };

  return (
    <div
      className={
        "flex justify-between items-center bg-accent-foreground p-2 w-full"
      }
    >
      <div className="flex flex-col gap-y-1">
        <span className="text-background font-medium text-sm">
          Archive Document
        </span>
        <span className="text-background/80 text-xs font-normal">
          This Document is in trash and will be deleted after 30 days. Either
          restore it or remove it permanantly.
        </span>
      </div>
      <div className="flex gap-x-1 items-center">
        <Button
          size="sm"
          variant="outline"
          className="border-background/10 bg-transparent dark:hover:bg-background/10 hover:bg-background/20 hover:text-background text-background/80"
          onClick={onRestore}
        >
          Restore
        </Button>
        <ConfirmModal
          title="Remove Document"
          description="Are you sure you want to remove this document permanently?"
          onConfirm={onRemove}
        >
          <Button
            size="sm"
            className="bg-background text-foreground hover:bg-background/80 hover:text-foreground"
          >
            Remove
          </Button>
        </ConfirmModal>
      </div>
    </div>
  );
};
