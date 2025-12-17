import "./globals.css";
import type { Metadata } from "next";
import Head from "next/head";

const APP_URL = "https://base-gas-coach.vercel.app";
const OG_IMAGE = `${APP_URL}/og-image.png`;

export const metadata: Metadata = {
  title: "Base Gas Coach",
  description: "See where your Base gas goes and cut waste.",
  openGraph: {
    title: "Base Gas Coach",
    description: "See where your gas goes on Base and cut waste.",
    url: APP_URL,
    images: [{ url: OG_IMAGE }],
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
      <Head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={OG_IMAGE} />
        <meta property="fc:frame:button:1" content="Open Base Gas Coach" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content={APP_URL} />
      </Head>
      <body>{children}</body>
    </html>
  );
}
