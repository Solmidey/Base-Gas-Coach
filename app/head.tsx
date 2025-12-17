export default function Head() {
  return (
    <>
      <title>Base Gas Coach</title>
      <meta
        name="description"
        content="See where your gas goes on Base and cut waste."
      />

      {/* Open Frames embed */}
      <meta name="of:version" content="vNext" />
      <meta name="of:accepts:frame" content="vNext" />

      {/* Farcaster frame (older fc:frame tags) */}
      <meta name="fc:frame" content="vNext" />
      <meta
        name="fc:frame:image"
        content="https://base-gas-coach.vercel.app/og-image.png"
      />
      <meta
        name="fc:frame:button:1"
        content="Open Base Gas Coach"
      />
      <meta name="fc:frame:button:1:action" content="link" />
      <meta
        name="fc:frame:button:1:target"
        content="https://base-gas-coach.vercel.app"
      />

      {/* OpenGraph / Twitter */}
      <meta property="og:title" content="Base Gas Coach" />
      <meta
        property="og:description"
        content="See where your gas goes on Base and cut waste."
      />
      <meta property="og:url" content="https://base-gas-coach.vercel.app" />
      <meta
        property="og:image"
        content="https://base-gas-coach.vercel.app/og-image.png"
      />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Base Gas Coach" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Base Gas Coach" />
      <meta
        name="twitter:description"
        content="See where your gas goes on Base and cut waste."
      />
      <meta
        name="twitter:image"
        content="https://base-gas-coach.vercel.app/og-image.png"
      />
    </>
  );
}
