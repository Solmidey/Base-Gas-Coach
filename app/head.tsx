export default function Head() {
  const image = "https://base-gas-coach.vercel.app/og-image.png";
  const url = "https://base-gas-coach.vercel.app";

  return (
    <>
      <title>Base Gas Coach</title>
      <meta name="description" content="See where your Base gas goes." />

      {/* Open Graph */}
      <meta property="og:title" content="Base Gas Coach" />
      <meta
        property="og:description"
        content="See where your gas goes on Base and cut waste."
      />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Farcaster Frame embed */}
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content={image} />
      <meta property="fc:frame:button:1" content="Open Base Gas Coach" />
      <meta property="fc:frame:button:1:action" content="link" />
      <meta property="fc:frame:button:1:target" content={url} />
    </>
  );
}
