"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { spaceGrotesk, dmsans } from "../../ui/fonts";
import { MdEmail, MdLock, MdPerson, MdPersonAdd } from "react-icons/md";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
      } else {
        // Redirect to login page after successful registration
        router.push("/auth/login?message=Registration successful! Please sign in.");
      }
    } catch (error) {
      setError("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-[var(--accent)] transform hover:scale-105 transition-transform duration-300">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-[var(--accent)] rounded-full flex items-center justify-center mb-6">
              <MdPersonAdd className="text-3xl text-[var(--primary-text)]" />
            </div>
            <h2 className={`text-3xl font-bold text-[var(--primary-text)] mb-2 ${spaceGrotesk.className}`}>
              Join the Fun!
            </h2>
            <p className={`text-[var(--secondary-text)] mb-6 ${dmsans.className}`}>
              Create your creative account
            </p>
            <p className={`text-sm text-[var(--secondary-text)] ${dmsans.className}`}>
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-bold text-[var(--accent)] hover:text-[var(--primary-text)] transition-colors duration-200 underline decoration-2 underline-offset-4"
              >
                Sign in here!
              </Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="name" className={`block text-sm font-medium text-[var(--primary-text)] mb-2 ${dmsans.className}`}>
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`w-full px-4 py-3 border-3 border-[var(--accent)] rounded-2xl bg-white text-[var(--primary-text)] placeholder-[var(--secondary-text)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)] focus:border-transparent transition-all duration-200 ${dmsans.className}`}
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="absolute right-3 top-11 text-xl text-[var(--secondary-text)]">
                  <MdPerson />
                </div>
              </div>
              
              <div className="relative">
                <label htmlFor="email" className={`block text-sm font-medium text-[var(--primary-text)] mb-2 ${dmsans.className}`}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`w-full px-4 py-3 border-3 border-[var(--accent)] rounded-2xl bg-white text-[var(--primary-text)] placeholder-[var(--secondary-text)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)] focus:border-transparent transition-all duration-200 ${dmsans.className}`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="absolute right-3 top-11 text-xl text-[var(--secondary-text)]">
                  <MdEmail />
                </div>
              </div>
              
              <div className="relative">
                <label htmlFor="password" className={`block text-sm font-medium text-[var(--primary-text)] mb-2 ${dmsans.className}`}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`w-full px-4 py-3 border-3 border-[var(--accent)] rounded-2xl bg-white text-[var(--primary-text)] placeholder-[var(--secondary-text)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)] focus:border-transparent transition-all duration-200 ${dmsans.className}`}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute right-3 top-11 text-xl text-[var(--secondary-text)]">
                  <MdLock />
                </div>
              </div>
            </div>

            {error && (
              <div className={`text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl border-2 border-red-200 ${dmsans.className}`}>
                ❌ {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center gap-2 py-3 px-4 border-3 border-[var(--accent)] rounded-2xl text-sm font-bold text-[var(--primary-text)] bg-[var(--accent)] hover:bg-[var(--surface)] hover:border-[var(--primary-text)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 ${dmsans.className}`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--primary-text)] border-t-transparent"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    <MdPersonAdd className="text-lg" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
