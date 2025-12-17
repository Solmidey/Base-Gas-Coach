const APP_URL = "https://base-gas-coach.vercel.app";
const OG_IMAGE = `${APP_URL}/og-image.png`;

export default function Head() {
  return (
    <>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content={OG_IMAGE} />
      <meta property="fc:frame:button:1" content="Open Base Gas Coach" />
      <meta property="fc:frame:button:1:action" content="link" />
      <meta property="fc:frame:button:1:target" content={APP_URL} />
    </>
  );
}
