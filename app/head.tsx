export default function Head() {
  const title = "Base Gas Coach";
  const description = "See where your gas goes on Base and cut waste.";
  const ogImage = "https://base-gas-coach.vercel.app/og-image.png";
  const url = "https://base-gas-coach.vercel.app";

  return (
    <>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content={description} />

      {/* Farcaster frame vNext */}
      <meta name="fc:frame" content="vNext" />
      <meta name="fc:frame:image" content={ogImage} />
      <meta name="fc:frame:button:1" content="Open Base Gas Coach" />
      <meta name="fc:frame:button:1:action" content="link" />
      <meta name="fc:frame:button:1:target" content={url} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </>
  );
}
