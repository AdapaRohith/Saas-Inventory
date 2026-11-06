
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navigation = [
  { name: "Overview", href: "/dashboard" },
  { name: "Products", href: "/dashboard/products/list" },
  { name: "Add Product", href: "/dashboard/products" },
  { name: "Inventory", href: "/dashboard/inventory" },
  { name: "Settings", href: "/dashboard/settings" },
];

interface NavLinksProps {
  pathname?: string;
  vertical?: boolean;
  onNavigate?: () => void;
}

function NavLinks({ pathname, vertical, onNavigate }: NavLinksProps) {
  return (
    <nav
      className={
        vertical ? "flex flex-col gap-2" : "flex flex-wrap items-center gap-2"
      }
    >
      {navigation.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" &&
            pathname?.startsWith(item.href + "/"));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "border border-black bg-white text-black"
                : "text-black hover:bg-black hover:text-white"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveNavLinks(props: Omit<NavLinksProps, "pathname">) {
  const pathname = usePathname();

  return <NavLinks {...props} pathname={pathname} />;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    localStorage.removeItem("token");
    router.replace("/");
  };

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-white backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/dashboard" className="text-2xl font-bold">
            Stock<span className="text-black">Flow</span>
          </Link>

          <div className="hidden md:block">
            <Suspense fallback={<NavLinks />}>
              <ActiveNavLinks />
            </Suspense>
          </div>

          <button
            onClick={handleLogout}
            className="hidden rounded-lg border border-slate-700 px-4 py-2 text-sm text-black transition hover:bg-black hover:text-white md:block"
          >
            Logout
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="rounded-lg border border-slate-700 p-2 text-black transition hover:bg-black hover:text-white md:hidden"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={`fixed inset-0 z-60 bg-black/50 transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!menuOpen}
        className={`fixed inset-y-0 right-0 z-70 flex w-72 max-w-[85vw] flex-col gap-6 overflow-y-auto border-l border-slate-800 bg-white p-6 transition-transform duration-300 md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">Menu</span>
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            className="rounded-lg border border-slate-700 p-2 text-black transition hover:bg-black hover:text-white"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <Suspense fallback={<NavLinks vertical onNavigate={closeMenu} />}>
          <ActiveNavLinks vertical onNavigate={closeMenu} />
        </Suspense>

        <button
          onClick={handleLogout}
          className="mt-auto rounded-lg border border-slate-700 px-4 py-2 text-sm text-black transition hover:bg-black hover:text-white"
        >
          Logout
        </button>
      </aside>

      <Suspense>{children}</Suspense>
    </div>
  );
}
