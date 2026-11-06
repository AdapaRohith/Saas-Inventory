
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const endpoint = isSignup ? "signup" : "login";

      const response = await fetch(
        `http://localhost:5000/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isSignup
              ? { name, email, password, organizationName }
              : { email, password }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      localStorage.setItem("token", data.token);

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row items-center justify-between bg-slate-1000 px-6 py-12 lg:px-24">

      <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
        <h1 className="text-6xl lg:text-8xl font-extrabold tracking-tight text-white">
          Stock<span className="text-blue-500">Flow</span>
        </h1>

        <p className="mt-6 max-w-lg text-lg lg:text-2xl text-slate-400 leading-relaxed">
          Inventory management, made simple.
          Take control of your stock, track products,
          and manage your business efficiently.
        </p>

        <div className="mt-10 flex gap-8 text-sm text-slate-500">
          <div>
            <p className="text-2xl font-bold text-blue-400">01</p>
            <p>Track inventory</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">02</p>
            <p>Manage products</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">03</p>
            <p>Monitor stock</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md shrink-0 rounded-2xl border border-slate-800 bg-gray-800 p-8 shadow-2xl">

        <h2 className="text-2xl font-semibold text-white">
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          {isSignup
            ? "Get started with StockFlow."
            : "Sign in to manage your inventory."}
        </p>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>

          {isSignup && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Your Name
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Organization Name
                </label>
                <input
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  type="text"
                  placeholder="Your company"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email Address
            </label>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {isSignup
            ? "Already have an account?"
            : "New to StockFlow?"}{" "}

          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            {isSignup ? "Sign In" : "Create Account"}
          </button>
        </p>
      </div>
    </main>
  );
}
