
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string | null;
  quantityOnHand: number;
  lowStockThreshold: number | null;
  sellingPrice: number | string | null;
  createdAt?: string;
}

type StockFilter = "all" | "low" | "in";

type SortOption =
  | "name-asc"
  | "name-desc"
  | "quantity-asc"
  | "quantity-desc"
  | "price-asc"
  | "price-desc"
  | "newest";

const PRODUCTS_PER_PAGE = 10;

export default function ProductsList() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/products/${id}`,
        {
          method: "DELETE",
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
        throw new Error("Failed to delete product");
      }

      setProducts((prev) =>
        prev.filter((product) => product.id !== id)
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    }
  }

  useEffect(() => {
    async function fetchProducts() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/products",
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
          throw new Error("Unable to load products.");
        }

        const data = await response.json();

        setProducts(
          Array.isArray(data) ? data : data.products ?? []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [router]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stockFilter, sortOption]);

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      product.sku.toLowerCase().includes(search);

    const threshold = product.lowStockThreshold ?? 5;
    const isLowStock = product.quantityOnHand <= threshold;

    const matchesFilter =
      stockFilter === "all" ||
      (stockFilter === "low" && isLowStock) ||
      (stockFilter === "in" && !isLowStock);

    return matchesSearch && matchesFilter;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "name-asc":
        return a.name.localeCompare(b.name);

      case "name-desc":
        return b.name.localeCompare(a.name);

      case "quantity-asc":
        return a.quantityOnHand - b.quantityOnHand;

      case "quantity-desc":
        return b.quantityOnHand - a.quantityOnHand;

      case "price-asc":
        return (
          (a.sellingPrice == null ? Infinity : Number(a.sellingPrice)) -
          (b.sellingPrice == null ? Infinity : Number(b.sellingPrice))
        );

      case "price-desc":
        return (
          (b.sellingPrice == null ? -Infinity : Number(b.sellingPrice)) -
          (a.sellingPrice == null ? -Infinity : Number(a.sellingPrice))
        );

      case "newest":
        return (
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
        );

      default:
        return 0;
    }
  });

  const totalPages = Math.max(
    1,
    Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE)
  );

  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * PRODUCTS_PER_PAGE;

  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  return (
    <main className="min-h-screen bg-white p-6 text-black sm:p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="mt-2 text-black">
              Manage all your inventory products.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard/products")}
            className="rounded-lg border border-black bg-white px-5 py-3 font-semibold transition hover:bg-black hover:text-white"
          >
            + Add Product
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">

          <div>
            <label className="mb-2 block text-sm text-black">
              Search products
            </label>

            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-white px-4 py-3 text-black outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-black">
              Filter by status
            </label>

            <select
              value={stockFilter}
              onChange={(e) =>
                setStockFilter(e.target.value as StockFilter)
              }
              className="w-full rounded-lg border border-slate-700 bg-white px-4 py-3 text-black outline-none focus:border-blue-500"
            >
              <option value="all">All Products</option>
              <option value="low">Low Stock</option>
              <option value="in">In Stock</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-black">
              Sort products
            </label>

            <select
              value={sortOption}
              onChange={(e) =>
                setSortOption(e.target.value as SortOption)
              }
              className="w-full rounded-lg border border-slate-700 bg-white px-4 py-3 text-black outline-none focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="name-asc">Name: A–Z</option>
              <option value="name-desc">Name: Z–A</option>
              <option value="quantity-asc">Quantity: Low to High</option>
              <option value="quantity-desc">Quantity: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-white p-6">
          <table className="w-full min-w-[800px] text-left text-sm">

            <thead className="border-b border-slate-700 text-black">
              <tr>
                <th className="pb-4">Product Name</th>
                <th className="pb-4">SKU</th>
                <th className="pb-4">Quantity</th>
                <th className="pb-4">Selling Price</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-black">
                    Loading products...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-black">
                    {error}
                  </td>
                </tr>
              ) : sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-black">
                    {products.length === 0
                      ? "No products found. Add your first product."
                      : "No products match your search or filter."}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const threshold = product.lowStockThreshold ?? 5;
                  const isLowStock =
                    product.quantityOnHand <= threshold;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-slate-700 last:border-0"
                    >
                      <td className="py-5 font-medium">
                        {product.name}
                      </td>

                      <td className="py-5 text-black">
                        {product.sku}
                      </td>

                      <td className="py-5">
                        {product.quantityOnHand}
                      </td>

                      <td className="py-5">
                        {product.sellingPrice == null
                          ? "—"
                          : `₹${Number(product.sellingPrice).toFixed(2)}`}
                      </td>

                      <td className="py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            isLowStock
                              ? "bg-white text-black"
                              : "bg-white text-black"
                          }`}
                        >
                          {isLowStock ? "Low Stock" : "In Stock"}
                        </span>
                      </td>

                      <td className="py-5">
                        <div className="flex gap-4">
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/products/${product.id}/edit`
                              )
                            }
                            className="font-medium text-black hover:bg-black hover:text-white"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(product.id)}
                            className="font-medium text-black hover:bg-black hover:text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && !error && sortedProducts.length > 0 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">

            <p className="text-sm text-black">
              Showing {startIndex + 1}–
              {Math.min(
                startIndex + PRODUCTS_PER_PAGE,
                sortedProducts.length
              )}{" "}
              of {sortedProducts.length} products
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(activePage - 1)}
                disabled={activePage === 1}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm transition enabled:hover:bg-black enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-9 min-w-9 rounded-lg px-3 text-sm transition ${
                    activePage === page
                      ? "border border-black bg-white text-black"
                      : "border border-slate-700 text-black hover:bg-black hover:text-white"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(activePage + 1)}
                disabled={activePage === totalPages}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm transition enabled:hover:bg-black enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <p className="mt-4 text-sm text-black">
          Total products: {loading ? "..." : products.length}
        </p>

      </div>
    </main>
  );
}
