import "./globals.css";
import type { Metadata } from "next";

const APP_URL = "https://base-gas-coach.vercel.app";
const OG_IMAGE = `${APP_URL}/og-image.png`;

export const metadata: Metadata = {
  title: "Base Gas Coach",
  description: "See where your gas goes on Base and cut waste.",
  openGraph: {
    title: "Base Gas Coach",
    description: "See where your gas goes on Base and cut waste.",
    url: APP_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Base Gas Coach",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Base Gas Coach",
    description: "See where your gas goes on Base and cut waste.",
    images: [OG_IMAGE],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": OG_IMAGE,
    "fc:frame:button:1": "Open Base Gas Coach",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": APP_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}
