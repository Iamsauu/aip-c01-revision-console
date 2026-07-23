import type { Metadata, Viewport } from "next";
import "@radix-ui/themes/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AIP-C01 Revision Console",
    template: "%s | AIP-C01 Revision Console",
  },
  description:
    "A source-backed revision system for the AWS Certified Generative AI Developer Professional exam.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "AIP-C01 Revision Console",
    description:
      "Revise the full official AIP-C01 blueprint, AWS services, and scenario decisions.",
    type: "website",
    images: [
      {
        url: "/aip-c01-social-card.png",
        width: 1672,
        height: 941,
        alt: "AIP-C01 Revision Console study dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIP-C01 Revision Console",
    description:
      "Revise the full official AIP-C01 blueprint, AWS services, and scenario decisions.",
    images: ["/aip-c01-social-card.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ef" },
    { media: "(prefers-color-scheme: dark)", color: "#111315" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
