import Link from "next/link";
import Image from "next/image";
import { Search, Camera } from "lucide-react";
import { LazyConstellation } from "@/components/three/LazyConstellation";

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 pb-24 overflow-hidden">
      {/* Three.js background — lazy loaded, deferred, disabled on low-end */}
      <LazyConstellation />

      {/* Content — always visible above canvas */}
      <div className="relative z-10 text-center space-y-6 max-w-md">
        <div className="font-mono text-xs text-neon tracking-[0.3em] uppercase animate-pulse-neon">
          [ PRICE INTELLIGENCE ACTIVE ]
        </div>

        <h1 className="text-4xl sm:text-5xl font-mono font-bold text-text-primary tracking-tight">
          Harga<span className="text-neon">Hantu</span>
          <Image
            src="/HeroIcon.png"
            alt=""
            width={40}
            height={40}
            className="inline-block ml-2 align-middle"
            aria-hidden="true"
          />
        </h1>

        <p className="text-text-secondary text-base leading-relaxed max-w-sm mx-auto">
          Groceries haunted by hidden price hikes? Scan your receipt. Track the
          truth. Help your community fight{" "}
          <span className="text-orange-bright font-medium">harga hantu</span>.
        </p>

        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/scan"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md font-mono text-sm bg-neon text-background border border-neon hover:bg-neon/90 active:scale-95 transition-all"
          >
            <Camera size={18} aria-hidden="true" />
            Scan Receipt
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md font-mono text-sm bg-transparent text-text-primary border border-border hover:border-border-bright active:scale-95 transition-all"
          >
            <Search size={18} aria-hidden="true" />
            Browse Prices
          </Link>
        </div>

        <div className="pt-8 font-mono text-xs text-text-muted">
          Community-powered price intel for Malaysia
        </div>
      </div>
    </div>
  );
}
