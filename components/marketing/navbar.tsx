"use client";

import { Button } from "@/components/ui/button";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { LoaderIcon } from "../loader-icon";
import { ModeToggle } from "../mode-toggle";
import { Logo } from "./logo";

export const Navbar = () => {
  const scrolled = useScrollTop();
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div
      className={cn(
        "fixed top-0 w-full p-3 flex items-center bg-background z-50",
        scrolled && "border-b shadow-accent-foreground",
      )}
    >
      <Logo />
      <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
        {isLoading && (
          <div className="flex items-center gap-x-2">
            <LoaderIcon strokeWidth={2} className="animate-spin" size={16} />
          </div>
        )}
        {!isLoading && !isAuthenticated && (
          <>
            <SignInButton
              appearance={{ variables: { fontFamily: "Inter" } }}
              mode="modal"
            >
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </SignInButton>
            <SignUpButton
              appearance={{ variables: { fontFamily: "Inter" } }}
              mode="modal"
            >
              <Button size="sm">Get Lumina Free</Button>
            </SignUpButton>
          </>
        )}
        {isAuthenticated && !isLoading && (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/documents">Enter Lumina</Link>
            </Button>
            <UserButton
              appearance={{ variables: { fontFamily: "Inter" } }}
              afterSwitchSessionUrl="/"
            />
          </>
        )}
        <ModeToggle />
      </div>
    </div>
  );
};
