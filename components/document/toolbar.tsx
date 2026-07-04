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
import { CrossIcon, ImageIcon, SmileIcon } from "@hugeicons/core-free-icons";

type ToolbarProps = {
  initialData: Doc<"documents">;
  preview?: boolean;
};

export const Toolbar = ({ initialData, preview }: ToolbarProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.title);

  const update = useMutation(api.documents.update);

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

  return (
    <div className="pl-13.5 group relative">
      {!!initialData.icon && !preview && (
        <div className="flex items-center gap-x-2 group/icon pt-6">
          <IconPicker onChange={() => {}}>
            <p className="text-6xl hover:opacity-75 transition ">
              {initialData.icon}
            </p>
          </IconPicker>
          <Button
            className="rounded-full opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground text-xs"
            variant="outline"
            size="icon"
          >
            <HugeiconsIcon icon={CrossIcon} className="h-4 w-4" />
          </Button>
        </div>
      )}
      {!!initialData.icon && preview && (
        <p className="text-6xl pt-6">{initialData.icon}</p>
      )}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4">
        {!initialData.icon && !preview && (
          <IconPicker onChange={() => {}} asChild>
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
          >
            <HugeiconsIcon icon={ImageIcon} className="h-4 w-4" />
            Add Cover Image
          </Button>
        )}
      </div>
      {isEditing && !preview && (
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={onKeyDown}
          className=""
        />
      )}
    </div>
  );
};
