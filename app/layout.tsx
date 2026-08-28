import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MEDICAL_ORGANIZATION } from "@/lib/schema";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

/* Variable axis rather than a weight list: the design uses 300 and 400 with a
   couple of heavier labels, and one variable file covers all of them. */
const sans = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={sans.variable}>
      <body>
        {/* Sitewide NAP and service catalog. The Organization and WebSite nodes
            stay in each page's own graph, matching the legacy markup. */}
        <JsonLd graphs={[MEDICAL_ORGANIZATION]} />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
