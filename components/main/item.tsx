"use client";
import React from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronDown, ChevronRight } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

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

  return (
    <div
      onClick={onClick}
      role="button"
      className={cn(
        "cursor-pointer group min-h-6.75 text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium",
        active && "bg-primary/5 text-primary",
      )}
      style={{ paddingLeft: level ? `${level * 12 + 12}px` : "12px" }}
    >
      {!!id && (
        <div
          role="button"
          className="h-full rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 mr-1"
        >
          <HugeiconsIcon
            icon={ChevronIcon}
            className="shrink-0 h-4 w-4 text-muted-foreground/50"
          />
        </div>
      )}
      {documentIcon ? (
        <div className="shrink-0 mr-2 text-[18px]">{documentIcon}</div>
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
    </div>
  );
};
