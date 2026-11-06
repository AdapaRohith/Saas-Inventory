
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navigation = [
  { name: "Overview", href: "/dashboard" },
  { name: "Products", href: "/dashboard/products/list" },
  { name: "Add Product", href: "/dashboard/products" },
  { name: "Inventory", href: "/dashboard/inventory" },
  { name: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/dashboard" className="text-2xl font-bold">
            Stock<span className="text-blue-500">Flow</span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            {navigation.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname.startsWith(item.href + "/"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
          >
            Logout
          </button>
        </div>
      </header>

      {children}
    </div>
  );
}
