export default function Head() {
  const baseUrl = "https://base-gas-coach.vercel.app";

  return (
    <>
      <title>Base Gas Coach</title>
      <meta
        name="description"
        content="See where your gas goes on Base and cut waste."
      />

      {/* Open Graph */}
      <meta property="og:title" content="Base Gas Coach" />
      <meta
        property="og:description"
        content="See where your gas goes on Base and cut waste."
      />
      <meta property="og:url" content={baseUrl} />
      <meta property="og:image" content={`${baseUrl}/og-image.png`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Base Gas Coach" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Base Gas Coach" />
      <meta
        name="twitter:description"
        content="See where your gas goes on Base and cut waste."
      />
      <meta name="twitter:image" content={`${baseUrl}/og-image.png`} />

      {/* Farcaster frame / miniapp launch */}
      <meta name="fc:frame" content="vNext" />
      <meta name="fc:frame:image" content={`${baseUrl}/og-image.png`} />
      <meta name="fc:frame:button:1" content="Open Base Gas Coach" />
      <meta name="fc:frame:button:1:action" content="launch" />
      <meta
        name="fc:frame:button:1:target"
        content="base-gas-coach"
      />
    </>
  );
}
