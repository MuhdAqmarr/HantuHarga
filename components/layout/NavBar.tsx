"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Camera, ShoppingBasket, User } from "lucide-react";

const NAV_ITEMS: {
  href: string;
  icon: typeof Home;
  label: string;
  highlight?: boolean;
}[] = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/scan", icon: Camera, label: "Scan", highlight: true },
  { href: "/basket", icon: ShoppingBasket, label: "Basket" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function NavBar() {
  const pathname = usePathname();
  const isScanFlow =
    pathname.startsWith("/scan/crop") ||
    pathname.startsWith("/scan/process") ||
    pathname.startsWith("/scan/review");

  if (isScanFlow) return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-sm border-t border-border"
      aria-label="Main navigation"
    >
      <ul className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label, highlight }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                className={[
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-colors",
                  highlight
                    ? "text-neon border border-neon/30 bg-neon/5"
                    : isActive
                      ? "text-neon"
                      : "text-text-muted hover:text-text-secondary",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={20} aria-hidden="true" />
                <span className="text-[10px] font-mono">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
