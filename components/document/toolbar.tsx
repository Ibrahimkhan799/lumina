"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { IconPicker } from "./icon-picker";
import { HugeiconsIcon } from "@hugeicons/react";
import { MultiplicationSignIcon, ImageIcon, SmileIcon } from "@hugeicons/core-free-icons";
import { Textarea } from "../ui/textarea";
import TextareaAutosize from "react-textarea-autosize";
import { DocumentIcon } from "../document-icon";
import { useCoverImage } from "@/hooks/use-cover-image";

type ToolbarProps = {
  initialData: Doc<"documents">;
  preview?: boolean;
};

export const Toolbar = ({ initialData, preview }: ToolbarProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.title);

  const update = useMutation(api.documents.update);

  const coverImage = useCoverImage();

  const enableInput = () => {
    if (preview) return;

    setIsEditing(true);
    setTimeout(() => {
      setValue(initialData.title);
      inputRef.current?.focus();
    }, 0);
  };

  const disableInput = () => {
    setIsEditing(false);
  };

  const onInput = (value: string) => {
    setValue(value);
    update({ id: initialData._id, title: value ?? "Untitled" });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      disableInput();
    }
  };

  const onIconSelect = (icon: string) => {
    update({ id: initialData._id, icon });
  };

  const onRemoveIcon = () => {
    update({ id: initialData._id, icon: "" });
  };

  return (
    <div className="pl-13.5 group relative">
      {!!initialData.icon && !preview && (
        <div className="flex items-center gap-x-2 group/icon -mt-7">
          <IconPicker onChange={onIconSelect}>
            <p className="text-6xl hover:opacity-75 transition ">
              <DocumentIcon icon={initialData.icon} size={60} />
            </p>
          </IconPicker>
          <Button
            className="rounded-full opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground text-xs"
            variant="outline"
            size="icon"
            onClick={onRemoveIcon}
          >
            <HugeiconsIcon strokeWidth={2} icon={MultiplicationSignIcon} className="h-4 w-4" />
          </Button>
        </div>
      )}
      {!!initialData.icon && preview && (
        <p className="text-6xl -mt-7">
          <DocumentIcon icon={initialData.icon} size={60} />
        </p>
      )}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4">
        {!initialData.icon && !preview && (
          <IconPicker onChange={onIconSelect} asChild>
            <Button
              className="text-muted-foreground text-xs"
              variant="outline"
              size="sm"
            >
              <HugeiconsIcon icon={SmileIcon} className="h-4 w-4" />
              Add Icon
            </Button>
          </IconPicker>
        )}
        {!initialData.coverImage && !preview && (
          <Button
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
            onClick={coverImage.onOpen}
          >
            <HugeiconsIcon icon={ImageIcon} className="h-4 w-4" />
            Add Cover Image
          </Button>
        )}
      </div>
      {isEditing && !preview ? (
        <TextareaAutosize
          ref={inputRef}
          onBlur={disableInput}
          onKeyDown={onKeyDown}
          value={value}
          onChange={(e) => onInput(e.target.value)}
          className="text-5xl bg-transparent font-bold wrap-break-words outline-none resize-none text-accent-foreground/80"
        />
      ) : (
        <div
          onClick={enableInput}
          className="pb-2.75 text-5xl font-bold wrap-break-words outline-none text-accent-foreground/80"
        >
          {initialData.title}
        </div>
      )}
    </div>
  );
};
