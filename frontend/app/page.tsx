
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${endpoint}`,
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
    <main className="min-h-screen flex flex-col lg:flex-row items-center justify-between bg-white px-6 py-12 lg:px-24">

      <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
        <h1 className="text-6xl lg:text-8xl font-extrabold tracking-tight text-black">
          Stock<span className="text-black">Flow</span>
        </h1>

        <p className="mt-6 max-w-lg text-lg lg:text-2xl text-black leading-relaxed">
          Inventory management, made simple.
          Take control of your stock, track products,
          and manage your business efficiently.
        </p>

        <div className="mt-10 flex gap-8 text-sm text-black">
          <div>
            <p className="text-2xl font-bold text-black">01</p>
            <p>Track inventory</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-black">02</p>
            <p>Manage products</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-black">03</p>
            <p>Monitor stock</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md shrink-0 rounded-2xl border border-slate-800 bg-white p-8 shadow-2xl">

        <h2 className="text-2xl font-semibold text-black">
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>

        <p className="mt-2 text-sm text-black">
          {isSignup
            ? "Get started with StockFlow."
            : "Sign in to manage your inventory."}
        </p>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>

          {isSignup && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Your Name
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-lg border border-slate-700 bg-white px-4 py-3 text-black outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Organization Name
                </label>
                <input
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  type="text"
                  placeholder="Your company"
                  className="w-full rounded-lg border border-slate-700 bg-white px-4 py-3 text-black outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-black">
              Email Address
            </label>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-700 bg-white px-4 py-3 text-black outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black">
              Password
            </label>
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-lg border border-slate-700 bg-white px-4 py-3 text-black outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-black">{error}</p>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-lg border border-black bg-white py-3 font-semibold text-black transition enabled:hover:bg-black enabled:hover:text-white disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-black">
          {isSignup
            ? "Already have an account?"
            : "New to StockFlow?"}{" "}

          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
            className="font-semibold text-black hover:bg-black hover:text-white"
          >
            {isSignup ? "Sign In" : "Create Account"}
          </button>
        </p>
      </div>
    </main>
  );
}
