"use client";

import { useEffect, useState } from "react";
import { useSearch } from "../hooks/use-search";
import { useSettings } from "../hooks/use-settings";
import { useTrash } from "../hooks/use-trash";
import {
  FileIcon,
  PlusSignIcon,
  SettingsIcon,
  Trash,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import { api } from "@/convex/_generated/api";
import { HugeiconsIcon } from "@hugeicons/react";
import { DocumentIcon } from "./document-icon";

export const SearchCommand = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const documents = useQuery(api.documents.search);
  const create = useMutation(api.documents.create);
  const { toggle, isOpen, onClose } = useSearch();
  const { onOpen: openSettings } = useSettings();
  const { onOpen: openTrash } = useTrash();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [toggle]);

  const onSelect = (id: string) => {
    router.push(`/documents/${id}`);
    onClose();
  };

  const onCreate = () => {
    onClose();
    const promise = create({ title: "Untitled" }).then((docId) => {
      router.push(`/documents/${docId}`);
    });

    toast.promise(promise, {
      loading: "Creating...",
      success: "Document created!",
      error: "Failed to create document.",
    });
  };

  const onOpenSettings = () => {
    onClose();
    openSettings();
  };

  const onOpenTrash = () => {
    onClose();
    openTrash();
  };

  const onLogout = () => {
    onClose();
    signOut();
  };

  if (!isMounted) return null;

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <Command>
        <CommandInput placeholder={`Search ${user?.firstName}'s lumina...`} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Documents">
            {documents?.map((doc) => (
              <CommandItem
                key={doc._id}
                value={`${doc._id}-${doc.title}`}
                title={doc.title}
                onSelect={() => onSelect(doc._id)}
              >
                {doc.icon ? (
                  <p className="mr-2 text-[18px]">
                    <DocumentIcon icon={doc.icon} size={18} />
                  </p>
                ) : (
                  <HugeiconsIcon icon={FileIcon} className="mr-2 h-4 w-4" />
                )}
                <span>{doc.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem value="add-new-page" onSelect={onCreate}>
              <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
              <span>Add new page</span>
            </CommandItem>
            <CommandItem value="open-archive" onSelect={onOpenTrash}>
              <HugeiconsIcon icon={Trash} className="mr-2 h-4 w-4" />
              <span>Open archive</span>
            </CommandItem>
            <CommandItem value="settings" onSelect={onOpenSettings}>
              <HugeiconsIcon icon={SettingsIcon} className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
            <CommandItem value="logout" onSelect={onLogout}>
              <HugeiconsIcon icon={Logout01Icon} className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
};
