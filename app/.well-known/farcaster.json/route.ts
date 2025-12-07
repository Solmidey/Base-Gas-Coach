import { NextResponse } from "next/server";

// Dynamic Farcaster miniapp manifest (no hard-coded domain)
export function GET(request: Request) {
  const headers = new Headers(request.headers);
  const host = headers.get("x-forwarded-host") ?? headers.get("host") ?? "localhost:3000";
  const proto = headers.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = proto + "://" + host;

  const miniapp = {
    version: "1",
    name: "Base Gas Coach",
    iconUrl: origin + "/icon.png",
    homeUrl: origin,
    subtitle: "Base gas, made simple",
    description: "Track Base gas and get friendly coaching on bridges, swaps, and LP habits. Simple, fast, and Farcaster-ready.",
    primaryCategory: "utilities",
    tags: ["base","gas","tools","onchain","coach"],
    tagline: "Spend less gas, move smarter",
    buttonTitle: "Check Gas",
    ogTitle: "Base Gas Coach",
    ogDescription: "Live Base gas + lightweight coaching for better onchain practice.",
    ogImageUrl: origin + "/og-image.png",
    castShareUrl: origin + "/share",
    splashImageUrl: origin + "/splash.png",
    splashBackgroundColor: "#0f172a",
    heroImageUrl: origin + "/hero.png",
    imageUrl: origin + "/preview.png",
    screenshotUrls: [origin + "/shot-1.png", origin + "/shot-2.png"],
  };

  // accountAssociation is intentionally omitted.
  return NextResponse.json({ miniapp });
}
