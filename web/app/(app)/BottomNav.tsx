"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", key: "dashboard", icon: "🏠", label: "Home" },
  { href: "/appointments", key: "appointments", icon: "📅", label: "Appts" },
  { href: "/health", key: "health", icon: "📈", label: "Data" },
  { href: "/guide", key: "guide", icon: "📖", label: "Guide" },
  { href: "/support", key: "support", icon: "💛", label: "Support" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="tabs">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`tab-${tab.key}${active ? " active" : ""}`}
          >
            <span className="ic">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
