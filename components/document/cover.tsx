"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ImageIcon, MultiplicationSignIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useEdgeStore } from "@/lib/edgestore";
import { LoaderIcon } from "../loader-icon";

interface CoverProps {
  url?: string;
  preview?: boolean;
}

export const Cover = ({ url, preview }: CoverProps) => {
  const params = useParams();
  const coverImage = useCoverImage();
  const { edgestore } = useEdgeStore();
  const update = useMutation(api.documents.update);

  const [isRemoving, setIsRemoving] = useState(false);

  const onRemove = async () => {
    setIsRemoving(true);

    try {
      if (url) {
        await edgestore.publicFiles.delete({ url });
      }
      await update({ id: params.id as Id<"documents">, coverImage: "" });
    } catch (e) {
      console.log(e);
      toast.error("Failed to remove cover image.");
    }
    setIsRemoving(false);
  };

  return (
    <div
      className={cn(
        "relative w-full h-[35vh] group mt-[45.5px]",
        !url && "h-[12vh]",
        url && "bg-muted",
      )}
    >
      {!!url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Cover" className="object-cover w-full h-full" />
      )}
      {url && !preview && (
        <div
          className={cn(
            "opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2 transition",
            isRemoving && "opacity-100",
          )}
        >
          <Button
            onClick={() => coverImage.onReplace(url)}
            className="text-xs"
            size="sm"
            disabled={isRemoving}
          >
            <HugeiconsIcon icon={ImageIcon} className="h-4 w-4 mr-2" />
            Change cover
          </Button>
          <Button
            onClick={onRemove}
            className="text-xs"
            variant="destructive"
            size="sm"
            disabled={isRemoving}
          >
            {isRemoving ? (
              <LoaderIcon size={16} className="mr-2 animate-spin" />
            ) : (
              <HugeiconsIcon
                icon={MultiplicationSignIcon}
                className="h-4 w-4 mr-2"
              />
            )}
            {isRemoving ? "Removing..." : "Remove"}
          </Button>
        </div>
      )}
    </div>
  );
};

Cover.Skeleton = function CoverSkeleton() {
  return <Skeleton className="w-full h-[12vh]" />;
};
