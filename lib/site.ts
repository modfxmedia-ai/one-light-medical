/** Business identity and navigation, mirrored from the legacy site. */

export const SITE_URL = "https://onelightmedical.com";

export const BUSINESS = {
  name: "One Light Medical",
  streetAddress: "5701 Time Square Blvd Suite 340",
  addressLocality: "Amarillo",
  addressRegion: "TX",
  postalCode: "79119",
  phone: "806-334-3117",
  phoneHref: "tel:+18063343117",
  email: "wecare@onelightmedical.com",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=5701+Time+Square+Blvd+Suite+340+Amarillo+TX+79119",
  logo: "/wp-content/uploads/2024/10/59a02ad960baa2d8f52a4b81986ec85b_1200_80.webp",
} as const;

/** Verified profiles only. This list is what schema.org sameAs claims. */
export const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/bosspain2wellness/" },
  { label: "YouTube", href: "https://www.youtube.com/@onelightmedical8909" },
] as const;

/** Footer and contact only list networks that have a live profile URL. */
export const FOOTER_SOCIAL = SOCIAL_LINKS;

/** Regenerative offerings lead and point at the dedicated pillars page.
    Remaining items keep the legacy nav order. */
export const SERVICE_NAV = [
  { label: "Stem Cell", href: "/stem-cell/" },
  { label: "Wharton's Jelly", href: "/whartons-jelly/" },
  { label: "Why Exosomes", href: "/why-exosomes/" },
  { label: "Knee Pain Care", href: "/knee-pain/" },
  { label: "Neuropathy", href: "/neuropathy/" },
  { label: "Spinal Decompression", href: "/spinal-decompression/" },
  { label: "Softwave TRT Treatment", href: "/softwave-trt-treatment/" },
  { label: "Weight Loss & Red Light Therapy", href: "/weight-loss/" },
] as const;

export const SERVICE_LINKS_LABEL = "Our Services";

export const PRIMARY_NAV = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us/" },
  { label: "Blog", href: "/blog/" },
  // Testimonials is a homepage anchor on the legacy site, not a standalone page.
  { label: "Testimonials", href: "/#Testimonials" },
  { label: "Contact", href: "/contact/" },
  { label: "Patient Paperwork", href: "/patient-paperwork/" },
] as const;

/** Footer service labels differ slightly from the nav on the legacy site. */
export const FOOTER_SERVICE_NAV = SERVICE_NAV.map((item) =>
  item.label === "Neuropathy" ? { ...item, label: "Neuropathy Care" } : item,
);

export const FOOTER_QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us/" },
  { label: "Our Services", href: "/services/" },
  { label: "Patient Paperwork", href: "/patient-paperwork/" },
  { label: "Testimonials", href: "/#Testimonials" },
  { label: "Contact", href: "/contact/" },
] as const;

export const FOOTER_LEGAL = [
  { label: "Privacy Policy", href: "/privacy-policy/" },
  { label: "Terms & Conditions", href: "/terms-and-conditions/" },
] as const;
