import { Heading } from "@/components/marketing/heading";
import { HeroImages } from "@/components/marketing/hero-images";
import { Footer } from "@/components/marketing/footer";


export default function LandingPage() {
  return (
    <div className="min-h-full flex flex-col">
      <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 px-6 pb-10">
        <Heading />
        <HeroImages />
      </div>
      <Footer />
    </div>
  );
}
