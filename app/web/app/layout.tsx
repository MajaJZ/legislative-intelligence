import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CookieBanner from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: {
    default: "Legislative Intelligence",
    template: "%s | Legislative Intelligence",
  },
  description:
    "Track federal bills and see disclosed lobbying and campaign contributions connected to each bill's sponsor and cosponsors.",
  metadataBase: new URL("https://legislativeintelligence.org"),
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Legislative Intelligence",
    description:
      "A public record of bills, sponsors, disclosed lobbying, and disclosed campaign contributions.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <CookieBanner />
      </body>
    </html>
  );
}
