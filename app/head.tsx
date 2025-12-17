export default function Head() {
  const title = "Base Gas Coach";
  const description = "See where your gas goes on Base and cut waste.";
  const url = "https://base-gas-coach.vercel.app";
  const image = `${url}/og-image.png`;

  return (
    <>
      {/* Basic */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* OpenGraph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Open Frames (optional but nice) */}
      <meta name="of:version" content="vNext" />
      <meta name="of:image" content={image} />

      {/* Farcaster Frame vNext */}
      <meta name="fc:frame" content="vNext" />
      <meta name="fc:frame:image" content={image} />
      <meta name="fc:frame:image:aspect_ratio" content="1.91:1" />
      <meta name="fc:frame:button:1" content="Open Base Gas Coach" />
      <meta name="fc:frame:button:1:action" content="link" />
      <meta name="fc:frame:button:1:target" content={url} />
    </>
  );
}
