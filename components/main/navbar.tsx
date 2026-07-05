"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

import { Menu09Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Title } from "./title";
import { Banner } from "./banner";
import Menu from "./menu";
import { Publish } from "./publish";

type NavbarProps = {
  isCollapsed: boolean;
  onResetWidthAction: () => void;
};

export const Navbar = ({ isCollapsed, onResetWidthAction }: NavbarProps) => {
  const params = useParams();
  const document = useQuery(api.documents.getById, {
    id: params.id as Id<"documents">,
  });

  if (document === undefined) {
    return (
      <nav className="bg-background px-3 py-2 w-full flex items-center justify-between">
        <Title.Skeleton />
        <div className="flex items-center gap-x-2">
          <Menu.Skeleton />
        </div>
      </nav>
    );
  }

  if (document === null) {
    return null;
  }

  return (
    <>
      {document.isArchived && <Banner documentId={document._id} />}
      <nav className="bg-background px-3 py-2 w-full flex items-center gap-x-4">
        {isCollapsed && (
          <div
            role="button"
            onClick={onResetWidthAction}
            className={cn(
              "h-6 w-6 flex items-center justify-center text-muted-foreground rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition",
            )}
          >
            <HugeiconsIcon
              icon={Menu09Icon}
              role="button"
              className="w-5 h-5 text-muted-foreground"
            />
          </div>
        )}
        <div className="flex items-center justify-between w-full">
          <Title initialData={document} />
          <div className="flex items-center gap-x-2">
            <Publish initialData={document} />
            {!document.isArchived && <Menu documentId={document._id} />}
          </div>
        </div>
      </nav>
    </>
  );
};
