
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Product {
  name: string;
  sku: string;
  description: string | null;
  quantityOnHand: number;
  costPrice: number | string | null;
  sellingPrice: number | string | null;
  lowStockThreshold: number | null;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    quantityOnHand: "0",
    costPrice: "",
    sellingPrice: "",
    lowStockThreshold: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/");
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5000/api/products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/");
          return;
        }

        if (!res.ok) {
          throw new Error("Unable to fetch product.");
        }

        const product: Product = await res.json();

        setForm({
          name: product.name,
          sku: product.sku,
          description: product.description ?? "",
          quantityOnHand: String(product.quantityOnHand),
          costPrice: product.costPrice == null ? "" : String(product.costPrice),
          sellingPrice:
            product.sellingPrice == null ? "" : String(product.sellingPrice),
          lowStockThreshold:
            product.lowStockThreshold == null
              ? ""
              : String(product.lowStockThreshold),
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id, router]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(
        `http://localhost:5000/api/products/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name,
            sku: form.sku,
            description: form.description || null,
            quantityOnHand: Number(form.quantityOnHand),
            costPrice: form.costPrice === "" ? null : Number(form.costPrice),
            sellingPrice:
              form.sellingPrice === "" ? null : Number(form.sellingPrice),
            lowStockThreshold:
              form.lowStockThreshold === ""
                ? null
                : Number(form.lowStockThreshold),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update product.");
      }

      router.push("/dashboard/products/list");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-8 text-black">
        Loading product...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-6 text-black sm:p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="mt-2 text-black">
          Update your inventory product details.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-xl border border-slate-800 bg-white p-6"
        >
          {[
            { label: "Product Name", name: "name", type: "text" },
            { label: "SKU", name: "sku", type: "text" },
            { label: "Quantity", name: "quantityOnHand", type: "number" },
            { label: "Cost Price", name: "costPrice", type: "number" },
            { label: "Selling Price", name: "sellingPrice", type: "number" },
            {
              label: "Low Stock Threshold",
              name: "lowStockThreshold",
              type: "number",
            },
          ].map((field) => (
            <div key={field.name}>
              <label className="mb-2 block text-sm text-black">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                required={
                  field.name === "name" ||
                  field.name === "sku" ||
                  field.name === "quantityOnHand"
                }
                min={field.type === "number" ? "0" : undefined}
                step={
                  field.name === "costPrice" ||
                  field.name === "sellingPrice"
                    ? "0.01"
                    : "1"
                }
                className="w-full rounded-lg border border-slate-700 bg-white px-4 py-3 text-black outline-none focus:border-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="mb-2 block text-sm text-black">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-white px-4 py-3 text-black outline-none focus:border-blue-500"
            />
          </div>

          {error && <p className="text-sm text-black">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg border border-black bg-white px-6 py-3 font-semibold enabled:hover:bg-black enabled:hover:text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Update Product"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard/products/list")}
              className="rounded-lg border border-black bg-white px-6 py-3 font-semibold hover:bg-black hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
