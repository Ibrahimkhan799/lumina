"use client";
import { LoaderIcon } from "@/components/loader-icon";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/main/navigation";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderIcon strokeWidth={2} className="animate-spin" size={18} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return redirect("/");
  }

  return (
    <div className="h-full flex">
      <Navigation />
      <main className="flex-1 h-full overflow-y-auto">{children}</main>
    </div>
  );
}
