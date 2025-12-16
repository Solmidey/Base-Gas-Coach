import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
      accountAssociation: {
    header: "eyJmaWQiOjg2MTE1NCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGVjRDIzMzRlMTY4NDlBNEE3QUEwYjU4QkJiMWVlYUFFMTc2YTk5NTMifQ",
    payload: "eyJkb21haW4iOiJiYXNlLWdhcy1jb2FjaC52ZXJjZWwuYXBwIn0",
    signature: "m+d2KhkefFxuHYsClg10AJJ54R5tXh70j5HCRdXGn3BtzGrJgL63uY1Q9DgECaNiF/NShigTrsY2erwKF+3c5Bw=",
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
