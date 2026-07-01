"use client";

import Image from "next/image";

export const Logo = () => {
  return (
    <div className="hidden md:flex items-center gap-x-2">
      <Image src="/logo.svg" alt="Lumina Logo" height={100} width={100} className="dark:hidden h-6 w-auto" />
      <Image src="/logo-dark.svg" alt="Lumina Logo" height={100} width={100} className="dark:block hidden h-6 w-auto" />
    </div>
  );
};


export const LogoWithText = () => {
  return (
    <div className="hidden md:flex items-center gap-x-2">
      <Image src="/logo-text-light.svg" alt="Lumina Logo" height={100} width={100} className="h-7.5 w-auto" />
    </div>
  );
};
