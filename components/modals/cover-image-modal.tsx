"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useEdgeStore } from "@/lib/edgestore";
import { useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { SingleImageDropzone } from "../upload/single-image";
import {
  UploaderProvider,
  type UploadFn,
} from "@/components/upload/uploader-provider";

export function CoverImageModal() {
  const params = useParams();
  const { isOpen, url, onClose } = useCoverImage();
  const { edgestore } = useEdgeStore();
  const update = useMutation(api.documents.update);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setIsSubmitting(false);
    onClose();
  };

  const onChange: UploadFn = async ({ file, onProgressChange, }) => {
    setIsSubmitting(true);

    const res = await edgestore.publicFiles.upload({
      file,
      options: {
        replaceTargetUrl: url,
      },
      onProgressChange,
    });

    await update({ id: params.id as Id<"documents">, coverImage: res.url });

    handleClose();

    return res;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {url ? "Change cover image" : "Cover Image"}
          </DialogTitle>
        </DialogHeader>
        <UploaderProvider uploadFn={onChange} autoUpload>
          <SingleImageDropzone
            className="w-full outline-none"
            disabled={isSubmitting}
            showProgress
          />
        </UploaderProvider>
      </DialogContent>
    </Dialog>
  );
}
