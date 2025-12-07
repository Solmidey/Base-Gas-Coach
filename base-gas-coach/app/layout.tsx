import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base Gas Coach",
  description: "Base gas dashboard + lightweight onchain practice coach.",
  openGraph: {
    title: "Base Gas Coach",
    description: "Spend less gas. Move smarter on Base.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </div>
      </body>
    </html>
  );
}
