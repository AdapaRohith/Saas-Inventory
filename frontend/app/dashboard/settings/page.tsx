"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [threshold, setThreshold] = useState("5");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    fetch("http://localhost:5000/api/settings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load settings");
        return res.json();
      })
      .then((data) => {
        setThreshold(String(data.defaultLowStockThreshold));
      })
      .catch(() => setMessage("Unable to load settings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          defaultLowStockThreshold: Number(threshold),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update settings");
      }

      setMessage("Settings saved successfully!");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-white p-8 text-black">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-black">
          Manage your StockFlow preferences.
        </p>

        <div className="mt-8 rounded-xl border border-slate-800 bg-white p-6">
          <h2 className="text-xl font-semibold">Inventory Settings</h2>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-black">
              Default Low Stock Threshold
            </label>

            <input
              type="number"
              min="0"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-white px-4 py-3 text-black outline-none focus:border-blue-500"
            />

            <p className="mt-2 text-sm text-black">
              Products with stock at or below this quantity will be marked as
              low stock, unless they have their own threshold.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={loading || saving || threshold === ""}
            className="mt-6 rounded-lg border border-black bg-white px-6 py-3 font-medium enabled:hover:bg-black enabled:hover:text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {message && (
            <p className="mt-4 text-sm text-black">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}