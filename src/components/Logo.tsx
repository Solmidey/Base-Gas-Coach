"use client";

import Image from "next/image";

type LogoProps = {
  className?: string;
  size?: number;
};

export default function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl bg-slate-950/80 " + className
      }
      style={{ width: size, height: size }}
    >
      <Image
        src="/base-gas-coach-logo.png"
        alt="Base Gas Coach logo"
        fill
        sizes={size + "px"}
        priority
      />
    </div>
  );
}
