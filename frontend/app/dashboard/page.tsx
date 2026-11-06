
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  quantityOnHand: number;
  lowStockThreshold: number | null;
}

interface DashboardData {
  totalProducts: number;
  totalStockQuantity: number;
  lowStockCount: number;
  lowStockProducts: LowStockProduct[];
}

export default function Dashboard() {
  const [activePage, setActivePage] = useState("Overview");

  const [stats, setStats] = useState<DashboardData>({
    totalProducts: 0,
    totalStockQuantity: 0,
    lowStockCount: 0,
    lowStockProducts: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();

  const fetchDashboard = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data.");
      }

      const data = await response.json();

      setStats({
        totalProducts: data.totalProducts ?? 0,
        totalStockQuantity: data.totalStockQuantity ?? 0,
        lowStockCount: data.lowStockCount ?? 0,
        lowStockProducts: Array.isArray(data.lowStockProducts)
          ? data.lowStockProducts
          : [],
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const inventoryHealth =
    stats.totalProducts === 0
      ? 0
      : Math.round(
          ((stats.totalProducts - stats.lowStockCount) /
            stats.totalProducts) *
            100
        );

  return (
    <div className="min-h-screen bg-white text-black">

      <main className="min-w-0 flex-1 p-8">

        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Overview</h2>
            <p className="mt-2 text-black">
              Manage your inventory efficiently.
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-black transition enabled:hover:bg-black enabled:hover:text-white disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-white p-4 text-black">
            {error}
          </div>
        )}

        <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-xl border border-slate-800 bg-white p-6">
            <p className="text-sm text-black">Total Products</p>
            <h3 className="mt-3 text-3xl font-bold">
              {loading ? "..." : stats.totalProducts}
            </h3>
            <p className="mt-2 text-sm text-black">
              Products in your inventory
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-white p-6">
            <p className="text-sm text-black">Total Stock Quantity</p>
            <h3 className="mt-3 text-3xl font-bold">
              {loading ? "..." : stats.totalStockQuantity}
            </h3>
            <p className="mt-2 text-sm text-black">
              Units currently available
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-white p-6">
            <p className="text-sm text-black">Low Stock Items</p>
            <h3 className="mt-3 text-3xl font-bold text-black">
              {loading ? "..." : stats.lowStockCount}
            </h3>
            <p className="mt-2 text-sm text-black">
              Products that need restocking
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-white p-6">
            <p className="text-sm text-black">Inventory Health</p>
            <h3 className="mt-3 text-3xl font-bold text-black">
              {loading ? "..." : `${inventoryHealth}%`}
            </h3>
            <p className="mt-2 text-sm text-black">
              Products not marked low stock
            </p>
          </div>

        </section>

        <section className="mt-10 rounded-xl border border-slate-800 bg-white p-6">

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">
                Low Stock Products
              </h3>
              <p className="mt-1 text-sm text-black">
                Products that need restocking.
              </p>
            </div>

            <span className="rounded-full bg-white px-3 py-1 text-sm text-black">
              {loading ? "..." : `${stats.lowStockCount} items`}
            </span>
          </div>

          {loading ? (
            <p className="mt-6 text-black">
              Loading products...
            </p>
          ) : stats.lowStockProducts.length === 0 ? (
            <p className="mt-6 text-black">
              All products are sufficiently stocked!
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">

                <thead className="border-b border-slate-700 text-black">
                  <tr>
                    <th className="pb-4">Product</th>
                    <th className="pb-4">SKU</th>
                    <th className="pb-4">Available Quantity</th>
                    <th className="pb-4">Threshold</th>
                  </tr>
                </thead>

                <tbody>
                  {stats.lowStockProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-slate-700 last:border-0"
                    >
                      <td className="py-4 font-medium">
                        {product.name}
                      </td>

                      <td className="py-4 text-black">
                        {product.sku}
                      </td>

                      <td className="py-4 font-medium text-black">
                        {product.quantityOnHand}
                      </td>

                      <td className="py-4 text-black">
                        {product.lowStockThreshold ?? 5}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

          <button
            onClick={() => router.push("/dashboard/products/list")}
            className="mt-5 text-sm font-semibold text-black hover:bg-black hover:text-white"
          >
            View all products →
          </button>

        </section>

        <section className="mt-10 rounded-xl border border-slate-800 bg-white p-6">
          <h3 className="text-xl font-semibold">Quick Actions</h3>
          <p className="mt-2 text-sm text-black">
            Manage your inventory from here.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => router.push("/dashboard/products")}
              className="rounded-lg border border-black bg-white px-5 py-3 font-semibold transition hover:bg-black hover:text-white"
            >
              + Add Product
            </button>

            <button
              onClick={() => router.push("/dashboard/products/list")}
              className="rounded-lg border border-slate-700 px-5 py-3 font-semibold transition hover:bg-black hover:text-white"
            >
              View Products
            </button>

<button
  onClick={() => router.push("/dashboard/inventory")}
  className="rounded-lg border border-slate-700 px-5 py-3 font-semibold transition hover:bg-black hover:text-white"
>
  Manage Inventory
</button>
            <button
             onClick={() => router.push("/dashboard/inventory")}
             className="w-full text-left px-4 py-3 rounded-lg text-black hover:bg-black hover:text-white transition"
          >
             Inventory Management
            </button>

            <button
              onClick={() => router.push("/dashboard/settings")}
              className="rounded-lg border border-slate-700 px-5 py-3 font-semibold transition hover:bg-black hover:text-white"
            >
              Inventory Settings
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
