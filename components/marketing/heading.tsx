"use client";

import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
import { ChevronRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { LoaderIcon } from "../loader-icon";

export const Heading = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="max-w-3xl md:max-w-4xl space-y-4 ">
      <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-accent-foreground">
        Your <i>Ideas</i>, <b>Documents</b>,
        <p className="my-3 sm:my-4 md:my-8">
          {"&"}
          <span className="py-1 md:py-2 px-2 md:px-5 bg-accent rounded-full mx-1.5 md:mx-3">
            Plans.
          </span>
          <span className="underline">Unified.</span>
        </p>
      </h1>
      <h3 className="text-base md:text-xl text-accent-foreground">
        Lumina is the connected workspace where <br />
        better, faster work happens.
      </h3>
      {isLoading && (
        <div className="flex items-center gap-x-2 justify-center">
          <LoaderIcon strokeWidth={2} className="animate-spin" size={16} />
        </div>
      )}
      {!isLoading && !isAuthenticated && (
        <>
          <SignUpButton
            appearance={{ variables: { fontFamily: "Inter" } }}
            mode="modal"
          >
            <Button size="lg">
              Get Lumina Free
              <HugeiconsIcon icon={ChevronRightIcon} />
            </Button>
          </SignUpButton>
        </>
      )}
      {isAuthenticated && !isLoading && (
        <>
          <Button size="lg" asChild>
            <Link href="/documents">
              Enter Lumina
              <HugeiconsIcon icon={ChevronRightIcon} />
            </Link>
          </Button>
        </>
      )}
    </div>
  );
};
