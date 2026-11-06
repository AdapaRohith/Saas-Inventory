
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:5000/api";

interface Product {
  id: string;
  name: string;
  sku: string;
  quantityOnHand: number;
}

interface Activity {
  id: string;
  productName: string;
  sku: string;
  changeType: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT";
  previousQuantity: number;
  newQuantity: number;
  quantityChange: number;
  note: string | null;
  createdAt: string;
}

export default function InventoryPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [action, setAction] = useState("STOCK_IN");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const fetchData = useCallback(async () => {
    if (!token) {
      router.push("/");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [productResponse, activityResponse] = await Promise.all([
        fetch(`${API}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/inventory/activities?page=${page}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (productResponse.status === 401 || activityResponse.status === 401) {
        localStorage.removeItem("token");
        router.push("/");
        return;
      }

      if (!productResponse.ok || !activityResponse.ok) {
        throw new Error("Failed to load inventory data.");
      }

      const productData = await productResponse.json();
      const activityData = await activityResponse.json();

      setProducts(
        Array.isArray(productData)
          ? productData
          : productData.products || []
      );

      setActivities(activityData.activities || []);
      setTotalPages(activityData.pagination?.totalPages || 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [token, router, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedProduct) {
      setError("Please select a product.");
      return;
    }

    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      (action !== "ADJUSTMENT" && parsedQuantity <= 0) ||
      (action === "ADJUSTMENT" && parsedQuantity < 0)
    ) {
      setError(
        action === "ADJUSTMENT"
          ? "Enter a valid non-negative quantity."
          : "Enter a valid positive quantity."
      );
      return;
    }

    try {
      setSubmitting(true);

      const endpoint =
        action === "STOCK_IN"
          ? "stock-in"
          : action === "STOCK_OUT"
            ? "stock-out"
            : "adjust";

      const response = await fetch(
        `${API}/inventory/${endpoint}/${selectedProduct}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity: parsedQuantity,
            note,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Inventory update failed.");
      }

      setSuccess(data.message || "Inventory updated successfully.");
      setQuantity("");
      setNote("");
      setPage(1);

      await fetchData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeLabel = (type: Activity["changeType"]) => {
    if (type === "STOCK_IN") return "Stock In";
    if (type === "STOCK_OUT") return "Stock Out";
    return "Adjustment";
  };

  return (
    <main className="min-h-screen bg-white text-black p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-black mt-2">
              Manage stock movements and track inventory activity.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-black hover:text-white"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-white border border-red-500/30 text-black p-4 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-white border border-green-500/30 text-black p-4 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-1 bg-white border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">
              Update Stock
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-black mb-2">
                  Select Product
                </label>

                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-700 rounded-lg p-3 text-black"
                >
                  <option value="">Choose a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku}) — {product.quantityOnHand} units
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-black mb-2">
                  Operation
                </label>

                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full bg-white border border-slate-700 rounded-lg p-3 text-black"
                >
                  <option value="STOCK_IN">Stock In</option>
                  <option value="STOCK_OUT">Stock Out</option>
                  <option value="ADJUSTMENT">Adjust Quantity</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-black mb-2">
                  {action === "ADJUSTMENT"
                    ? "New Total Quantity"
                    : "Quantity"}
                </label>

                <input
                  type="number"
                  min={action === "ADJUSTMENT" ? 0 : 1}
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  placeholder="Enter quantity"
                  className="w-full bg-white border border-slate-700 rounded-lg p-3 text-black"
                />
              </div>

              <div>
                <label className="block text-sm text-black mb-2">
                  Note (Optional)
                </label>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Reason for stock change..."
                  className="w-full bg-white border border-slate-700 rounded-lg p-3 text-black resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || products.length === 0}
                className="w-full border border-black bg-white enabled:hover:bg-black enabled:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg p-3 font-semibold"
              >
                {submitting ? "Updating..." : "Update Inventory"}
              </button>
            </form>
          </section>

          <section className="lg:col-span-2 bg-white border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  Activity History
                </h2>
                <p className="text-black text-sm mt-1">
                  Recent stock movements
                </p>
              </div>

              <button
                onClick={fetchData}
                disabled={loading}
                className="text-black hover:bg-black hover:text-white text-sm"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="text-black py-10 text-center">
                Loading inventory...
              </p>
            ) : activities.length === 0 ? (
              <p className="text-black py-10 text-center">
                No inventory activity yet.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-black border-b border-slate-800">
                      <tr>
                        <th className="py-3 pr-4">Product</th>
                        <th className="py-3 pr-4">Type</th>
                        <th className="py-3 pr-4">Change</th>
                        <th className="py-3 pr-4">New Stock</th>
                        <th className="py-3">Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {activities.map((activity) => (
                        <tr
                          key={activity.id}
                          className="border-b border-slate-800/70"
                        >
                          <td className="py-4 pr-4">
                            <p className="font-medium">
                              {activity.productName}
                            </p>
                            <p className="text-black text-xs mt-1">
                              {activity.sku}
                            </p>
                          </td>

                          <td className="py-4 pr-4">
                            <span
                              className={`px-2 py-1 rounded-md text-xs ${
                                activity.changeType === "STOCK_IN"
                                  ? "bg-white text-black"
                                  : activity.changeType === "STOCK_OUT"
                                    ? "bg-white text-black"
                                    : "bg-white text-black"
                              }`}
                            >
                              {getTypeLabel(activity.changeType)}
                            </span>
                          </td>

                          <td className={`py-4 pr-4 font-semibold ${
                            activity.quantityChange > 0
                              ? "text-black"
                              : activity.quantityChange < 0
                                ? "text-black"
                                : "text-black"
                          }`}>
                            {activity.quantityChange > 0 ? "+" : ""}
                            {activity.quantityChange}
                          </td>

                          <td className="py-4 pr-4">
                            {activity.newQuantity}
                          </td>

                          <td className="py-4 text-black whitespace-nowrap">
                            {new Date(activity.createdAt).toLocaleDateString()}
                            <p className="text-xs text-black">
                              {new Date(activity.createdAt).toLocaleTimeString()}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-4 py-2 rounded-lg border border-slate-700 disabled:opacity-30"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-black">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 rounded-lg border border-slate-700 disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
