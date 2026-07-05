"use client";

import { use, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/document/toolbar";
import { Cover } from "@/components/document/cover";
import { DocumentNotFound } from "@/components/document/document-not-found";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

interface DocumentPageProps {
  params: Promise<{
    id: Id<"documents">;
  }>;
}

const DocumentPage = ({ params }: DocumentPageProps) => {
  const Editor = useMemo(
    () => dynamic(() => import("@/components/document/editor"), { ssr: false }),
    [],
  );

  const { id } = use(params);
  const document = useQuery(api.documents.getById, { id });

  const update = useMutation(api.documents.update);

  const onChange = (content: string) => {
    update({ id, content });
  };

  if (document === undefined) {
    return (
      <div className="pb-40">
        <Cover.Skeleton />
        <div className="md:max-w-3xl lg:max-w-4xl max-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-14 w-[40%]" />
            <Skeleton className="h-14 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  if (document === null) return <DocumentNotFound />;

  return (
    <div className="pb-40">
      <Cover url={document.coverImage} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar initialData={document} />
        <Editor onChange={onChange} initialContent={document.content} />
      </div>
    </div>
  );
};

export default DocumentPage;
