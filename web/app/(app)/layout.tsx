import Link from "next/link";
import { requireFamilyContext } from "@/lib/family/session";
import { ageString } from "@/lib/baby/age";
import { BabySwitcher } from "./BabySwitcher";
import { BottomNav } from "./BottomNav";
import { SearchButton } from "./SearchButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { babies, activeBaby } = await requireFamilyContext();

  return (
    <div className="app">
      <header className="top">
        <div className="who">
          <h1>{activeBaby?.name || "Newborn Companion"}</h1>
          {activeBaby?.dob && <div className="age">{ageString(activeBaby)}</div>}
        </div>
        <div className="header-icons">
          {babies.length > 1 && <BabySwitcher babies={babies} activeId={activeBaby?.id ?? null} />}
          <SearchButton />
          <Link href="/settings" className="icon-btn" aria-label="Settings">
            ⚙️
          </Link>
          <svg
            className="hero-badge"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="32" cy="32" r="30" fill="var(--accent-ink)" />
            <path
              d="M40 18a14 14 0 1 0 6 19.8A11 11 0 0 1 40 18Z"
              fill="var(--accent)"
            />
            <circle cx="18" cy="20" r="2.4" fill="var(--accent)" />
            <circle cx="14" cy="30" r="1.6" fill="var(--accent)" />
            <circle cx="46" cy="46" r="1.8" fill="var(--accent)" />
          </svg>
        </div>
        <svg className="wave" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,16 C60,32 120,0 200,14 C280,28 340,2 400,18 L400,40 L0,40 Z" />
        </svg>
      </header>

      <main>{children}</main>

      <BottomNav />
    </div>
  );
}
