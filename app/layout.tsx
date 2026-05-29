import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { WhatsAppFlotante } from "@/components/shared";
import { getNextMetadata } from "@/lib/seo/metadata";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = getNextMetadata("home");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-ui)]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFlotante />
      </body>
    </html>
  );
}
