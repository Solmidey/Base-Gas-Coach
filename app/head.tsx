export default function Head() {
  const title = "Base Gas Coach";
  const description = "See where your gas goes on Base and cut waste.";
  const url = "https://base-gas-coach.vercel.app";
  const ogImage = `${url}/og-image.png`;
  const miniappId = "019b29d4-89c0-4bf2-e108-c9b04fa3fc6d";
  const miniappUrl = `https://warpcast.com/~/miniapps/${miniappId}`;

  return (
    <>
      <title>{title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Farcaster mini app embed */}
      <meta name="fc:frame" content="vNext" />
      <meta name="fc:frame:image" content={ogImage} />
      <meta name="fc:frame:button:1" content="Open Base Gas Coach" />
      <meta name="fc:frame:button:1:action" content="link" />
      <meta name="fc:frame:button:1:target" content={miniappUrl} />
    </>
  );
}
