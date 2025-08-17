"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { spaceGrotesk, dmsans } from "../ui/fonts";

export default function WhiteboardPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Navbar */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border-2 border-[var(--accent)] px-6 py-3">
        <div className="flex items-center space-x-6">
          <div className={`text-xl font-bold text-[var(--primary-text)] ${spaceGrotesk.className}`}>
            DoodleSquad
          </div>
          
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className={`text-sm text-[var(--secondary-text)] ${dmsans.className}`}>
                Loading...
              </div>
            ) : session ? (
              <>
                <span className={`text-sm text-[var(--secondary-text)] ${dmsans.className}`}>
                  Welcome, {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className={`px-4 py-2 bg-[var(--accent)] text-[var(--primary-text)] rounded-xl text-sm font-medium hover:bg-[var(--surface)] transition-colors ${dmsans.className}`}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={`px-4 py-2 bg-[var(--accent)] text-[var(--primary-text)] rounded-xl text-sm font-medium hover:bg-[var(--surface)] transition-colors ${dmsans.className}`}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className={`px-4 py-2 border-2 border-[var(--accent)] text-[var(--primary-text)] rounded-xl text-sm font-medium hover:bg-[var(--accent)] transition-colors ${dmsans.className}`}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>    
    </div>
  );
}
