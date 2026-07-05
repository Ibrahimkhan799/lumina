"use client";

import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";

export const DocumentNotFound = () => {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/empty.svg"
        alt="Empty State Illustration"
        height={300}
        width={300}
        className="dark:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/empty-dark.svg"
        alt="Dark Empty State Illustration"
        height={300}
        width={300}
        className="hidden dark:block"
      />
      <h2 className="text-xl font-medium mt-3">Document not found</h2>
      <p className="text-sm text-muted-foreground max-w-sm text-center">
        This document may have been removed, or you might not have access to
        it.
      </p>
      <Button onClick={() => router.push("/documents")} size="lg">
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          className="h-4 w-4 mr-1 text-background"
          strokeWidth={2}
        />
        Back to Documents
      </Button>
    </div>
  );
};
