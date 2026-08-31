import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MEDICAL_ORGANIZATION } from "@/lib/schema";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

/* Stands in for the Figma frame's Avenir Next, which is licensed and so cannot
   be served from Google Fonts. Chosen on measured metrics rather than
   reputation -- see the type note in globals.css and scripts/font-match.mjs.
   The variable axis covers the 400, 500 and 700 the frame uses. */
const sans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
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
