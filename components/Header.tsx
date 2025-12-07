import Image from "next/image";

export function Header() {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Image
          src="/icon.png"
          alt="Base Gas Coach"
          width={40}
          height={40}
          className="rounded-xl"
          priority
        />
        <div>
          <h1 className="text-xl font-bold tracking-tight">Base Gas Coach</h1>
          <p className="text-sm text-white/70">Spend less gas. Move smarter on Base.</p>
        </div>
      </div>
      <span className="chip">
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
        Mini App UI
      </span>
    </header>
  );
}
