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
  logo: "/wp-content/uploads/2024/10/59a02ad960baa2d8f52a4b81986ec85b_1200_80.webp",
} as const;

/** Verified profiles only — this list is what schema.org sameAs claims. */
export const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/bosspain2wellness/" },
  { label: "Youtube", href: "https://www.youtube.com/@onelightmedical8909" },
] as const;

/**
 * The footer lists four networks in this order. One Light Medical has no
 * LinkedIn or Instagram profile on the live site, so those two render as plain
 * labels; add the URLs here and they become links.
 */
export const FOOTER_SOCIAL = ["LinkedIn", "Facebook", "Instagram", "Youtube"].map((label) => ({
  label,
  href: SOCIAL_LINKS.find((link) => link.label === label)?.href,
}));

/** Regenerative offerings lead and point at the dedicated pillars page.
    Remaining items keep the legacy nav order. */
export const SERVICE_NAV = [
  { label: "Stem Cell", href: "/#regenerative-stem-cell" },
  { label: "Wharton's Jelly", href: "/#regenerative-whartons-jelly" },
  { label: "Why Exosomes", href: "/#why-exosomes" },
  { label: "Knee Pain Care", href: "/knee-pain/" },
  { label: "Neuropathy", href: "/neuropathy/" },
  { label: "Spinal Decompression", href: "/spinal-decompression/" },
  { label: "Softwave TRT Treatment", href: "/softwave-trt-treatment/" },
  { label: "Weight Loss", href: "/weight-loss/" },
  { label: "Red Light Therapy", href: "/red-light-therapy/" },
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
  item.href === "/neuropathy/" ? { ...item, label: "Neuropathy Care" } : item,
);

export const FOOTER_QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us/" },
  { label: "Patient Paperwork", href: "/patient-paperwork/" },
  { label: "Testimonials", href: "/#Testimonials" },
  { label: "Contact", href: "/contact/" },
] as const;
