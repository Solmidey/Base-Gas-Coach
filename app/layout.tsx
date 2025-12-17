import "./globals.css";
import type { Metadata } from "next";

const APP_URL = "https://base-gas-coach.vercel.app";
const OG_IMAGE = `${APP_URL}/og-image.png`;

export const metadata: Metadata = {
  title: "Base Gas Coach",
  description: "See where your Base gas goes and cut waste.",
  openGraph: {
    title: "Base Gas Coach",
    description: "See where your gas goes on Base and cut waste.",
    url: APP_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Base Gas Coach – gas dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Base Gas Coach",
    description: "See where your gas goes on Base and cut waste.",
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
