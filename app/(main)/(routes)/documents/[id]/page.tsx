"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/document/toolbar";

interface DocumentPageProps {
  params: Promise<{
    id: Id<"documents">;
  }>;
}

const DocumentPage = ({ params }: DocumentPageProps) => {
  const { id } = use(params);
  const document = useQuery(api.documents.getById, { id });

  if (document === undefined) return <div>Loading...</div>;

  if (document === null) return <div>Document not found</div>;

  return (
    <div className="pb-40">
      <div className="h-[35vh]"/>
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar initialData={document} />
      </div>
    </div>
  );
};

export default DocumentPage;
