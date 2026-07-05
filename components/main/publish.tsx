"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useOrigin } from "@/hooks/use-origin";
import {
  Checkmark,
  CopyIcon,
  Globe02Icon,
  GlobeIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

type PublishProps = {
  initialData: Doc<"documents">;
};

export const Publish = ({ initialData }: PublishProps) => {
  const origin = useOrigin();
  const update = useMutation(api.documents.update);

  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const url = `${origin}/preview/${initialData._id}`;

  const onPublish = () => {
    setIsSubmitting(true);
    try {
      const promise = update({ id: initialData._id, isPublished: true });
      promise.finally(() => {
        setIsSubmitting(false);
      });

      toast.promise(promise, {
        loading: "Publishing...",
        success: "Published!",
        error: "Failed to publish.",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUnpublish = () => {
    setIsSubmitting(true);
    try {
      const promise = update({ id: initialData._id, isPublished: false });
      promise.finally(() => {
        setIsSubmitting(false);
      });

      toast.promise(promise, {
        loading: "Unpublishing...",
        success: "Unpublished!",
        error: "Failed to unpublish.",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCopyUrl = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    });
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button size="sm" variant="ghost">
          Publish
          {initialData.isPublished && (
            <HugeiconsIcon
              icon={Globe02Icon}
              className="text-sky-500 w-4 h-4 ml-2"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end" alignOffset={8} forceMount>
        {initialData.isPublished ? (
          <div className="space-y-4">
            <div className="flex items-center gap-x-2">
              <HugeiconsIcon
                icon={Globe02Icon}
                className="text-sky-500 animate-pulse w-4 h-4"
              />
              <p>This document is live on web.</p>
            </div>
            <div className="flex items-center">
              <input
                value={url}
                disabled
                className="flex-1 px-2 text-xs border rounded-l-md h-8 bg-muted truncate"
              />
              <Button
                onClick={onCopyUrl}
                disabled={copied}
                className="h-8 rounded-l-none"
              >
                {copied ? (
                  <HugeiconsIcon icon={Checkmark} className="w-4 h-4" />
                ) : (
                  <HugeiconsIcon icon={CopyIcon} className="w-4 h-4" />
                )}
              </Button>
            </div>
            <Button
              size="sm"
              className="w-full text-xs"
              onClick={onUnpublish}
              disabled={isSubmitting}
            >
              Unpublish
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <HugeiconsIcon
              icon={GlobeIcon}
              className="w-8 h-8 text-muted-foreground mb-2"
            />
            <p className="text-sm font-medium mb-2">Publish this document</p>
            <span className="text-xs text-muted-foreground mb-4">
              Share your work with others.
            </span>
            <Button
              className="w-full text-xs"
              disabled={isSubmitting}
              onClick={onPublish}
              size={"sm"}
            >
              Publish
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
