import Image from "next/image";
import Link from "next/link";

export default function SharePage() {
  // Replace YOUR_DOMAIN after deployment.
  const shareText = encodeURIComponent(
    "Checking Base gas with Base Gas Coach ⚡\nSpend less gas. Move smarter on Base.\nhttps://YOUR_DOMAIN"
  );
  const compose = `https://warpcast.com/~/compose?text=${shareText}`;

  return (
    <main className="space-y-6">
      <div className="glass p-6">
        <div className="flex items-center gap-3">
          <Image src="/icon.png" alt="Base Gas Coach" width={48} height={48} className="rounded-xl" />
          <div>
            <h1 className="text-2xl font-bold">Share Base Gas Coach</h1>
            <p className="text-white/70 text-sm">
              Invite your mutuals to test the app and compare gas moods.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <a className="btn" href={compose} target="_blank" rel="noreferrer">
            Compose on Warpcast
          </a>
          <Link className="btn-ghost" href="/">
            Back to dashboard
          </Link>
        </div>

        <p className="mt-4 text-xs text-white/50">
          Update YOUR_DOMAIN in the share text + manifest after deploy.
        </p>
      </div>
    </main>
  );
}
