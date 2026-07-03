import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter, Cascadia_Code} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ConvexProviderWrapper } from "@/components/providers/convex-provider";
import { Toaster } from "@/components/ui/sonner";
import { ModalProvider } from "@/components/providers/modal-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const code = Cascadia_Code({ subsets: ["latin"], variable: "--font-code" })

export const metadata: Metadata = {
  title: "Lumina",
  description: "The connected workspace where better, faster work happens.",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: dark)",
        url: "/logo-dark.svg",
        href: "/logo-dark.svg",
        type: "image/svg+xml",
      },
      {
        media: "(prefers-color-scheme: light)",
        url: "/logo.svg",
        href: "/logo.svg",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", inter.variable, code.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ConvexProviderWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="lumina-theme"
          >
            <ModalProvider />
            <Toaster position="bottom-right"/>
            {children}
          </ThemeProvider>
        </ConvexProviderWrapper>
      </body>
    </html>
  );
}
