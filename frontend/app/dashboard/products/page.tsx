
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProduct() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    quantityOnHand: "",
    lowStockThreshold: "",
    costPrice: "",
    sellingPrice: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    const payload = {
      name: form.name,
      sku: form.sku,
      description: form.description || undefined,
      quantityOnHand: Number(form.quantityOnHand),
      lowStockThreshold:
        form.lowStockThreshold === ""
          ? undefined
          : Number(form.lowStockThreshold),
      costPrice: form.costPrice === "" ? undefined : Number(form.costPrice),
      sellingPrice:
        form.sellingPrice === "" ? undefined : Number(form.sellingPrice),
    };

    try {
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create product");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-white px-4 py-3 text-black placeholder:text-slate-500 outline-none transition focus:border-blue-500";

  return (
    <main className="min-h-screen bg-white p-6 text-black sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Add Product</h1>
          <p className="mt-2 text-black">
            Add a new product to your inventory.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-800 bg-white p-6 shadow-xl sm:p-8"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-black">
              Product Name
            </label>
            <input
              required
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Wireless Mouse"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black">
              SKU
            </label>
            <input
              required
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="WM-001"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Product description..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-black">
                Quantity
              </label>
              <input
                required
                name="quantityOnHand"
                type="number"
                min="0"
                value={form.quantityOnHand}
                onChange={handleChange}
                placeholder="50"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black">
                Low Stock Threshold
              </label>
              <input
                name="lowStockThreshold"
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={handleChange}
                placeholder="5"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-black">
                Cost Price
              </label>
              <input
                name="costPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.costPrice}
                onChange={handleChange}
                placeholder="250"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black">
                Selling Price
              </label>
              <input
                name="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.sellingPrice}
                onChange={handleChange}
                placeholder="399"
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-black">{error}</p>
          )}

          <div className="flex justify-end border-t border-slate-700 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-black bg-white px-8 py-3 font-semibold text-black transition enabled:hover:bg-black enabled:hover:text-white disabled:opacity-50 sm:w-auto"
            >
              {loading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
