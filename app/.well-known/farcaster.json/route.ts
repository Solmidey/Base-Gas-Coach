import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
      accountAssociation: {
    header: "REAL_HEADER",
    payload: "REAL_PAYLOAD",
    signature: "REAL_SIGNATURE",
  },

    miniapp: {
      version: "1",
      name: "Base Gas Coach",
      homeUrl: "https://base-gas-coach.vercel.app",
      iconUrl: "https://base-gas-coach.vercel.app/base-gas-coach-logo.png",
      splashImageUrl: "https://base-gas-coach.vercel.app/splash.png",
      splashBackgroundColor: "#020617",
      subtitle: "Smarter gas on Base.",
      description:
        "Connect a Base wallet or address to uncover where gas is leaking and get clear steps to keep more of your upside.",
      screenshotUrls: [
        "https://base-gas-coach.vercel.app/shot-1.png",
        "https://base-gas-coach.vercel.app/shot-2.png"
      ]
    }
  });
}
