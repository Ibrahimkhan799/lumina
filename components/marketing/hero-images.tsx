"use client";

import Image from "next/image";


export const HeroImages = () => {
  return (
    <div className="flex flex-col items-center justify-center max-w-5xl ">
      <div className="flex items-center">
        <div className="relative w-50 h-50 sm:w-62.5 sm:h-62.5 md:w-75 md:h-75 ">
          <Image
            src="/assets/nc-recruit-directly.svg"
            alt="nc-recruit-directly"
            className="object-contain dark:hidden"
            fill
          />
          <Image
            src="/assets/nc-recruit-directly-dark.svg"
            alt="nc-recruit-directly"
            className="object-contain dark:block hidden"
            fill
          />
        </div>
        <div className="relative w-75 h-75 hidden md:block">
          <Image
            src="/assets/nc-sucking-into-the-work.svg"
            alt="nc-recruit-directly"
            className="object-contain dark:hidden"
            fill
          />
          <Image
            src="/assets/nc-sucking-into-the-work-dark.svg"
            alt="nc-recruit-directly"
            className="object-contain dark:block hidden"
            fill
          />
        </div>
      </div>
    </div>
  );
};
