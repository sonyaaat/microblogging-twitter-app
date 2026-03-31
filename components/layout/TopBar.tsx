"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface TopBarProps {
  username: string;
}

export default function TopBar({ username }: TopBarProps) {
  const pathname = usePathname();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<"feed" | "profile" | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const profileHref = `/profile/${encodeURIComponent(username)}`;
  const isFeed = pathname === "/feed";
  const isProfile = pathname?.startsWith("/profile/");

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 25,
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          minHeight: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          gap: 12,
        }}
      >
        <Link
          href="/feed"
          style={{
            background: "linear-gradient(90deg, #3b82f6, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            color: "transparent",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: 26,
          }}
        >
          Microlog
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setShowDrawer(true)}
            aria-label="Open menu"
            style={{
              border: "1.5px solid #e2e8f0",
              borderRadius: 20,
              padding: "8px 12px",
              background: "#ffffff",
              color: "#475569",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
            }}
          >
            ☰
          </button>
          <Link
            href="/feed"
            onMouseEnter={() => setHoveredLink("feed")}
            onMouseLeave={() => setHoveredLink(null)}
            style={{
              color: isFeed ? "#ffffff" : hoveredLink === "feed" ? "#334155" : "#475569",
              textDecoration: "none",
              padding: "8px 18px",
              borderRadius: 20,
              background: isFeed ? "linear-gradient(90deg, #3b82f6, #ec4899)" : "transparent",
              fontWeight: 500,
              fontSize: 17,
              transition: "color 0.15s ease",
            }}
          >
            Feed
          </Link>
          <Link
            href={profileHref}
            onMouseEnter={() => setHoveredLink("profile")}
            onMouseLeave={() => setHoveredLink(null)}
            style={{
              color: isProfile ? "#ffffff" : hoveredLink === "profile" ? "#334155" : "#475569",
              textDecoration: "none",
              padding: "8px 18px",
              borderRadius: 20,
              background: isProfile ? "linear-gradient(90deg, #3b82f6, #ec4899)" : "transparent",
              fontWeight: 500,
              fontSize: 17,
              transition: "color 0.15s ease",
            }}
          >
            Profile
          </Link>
          <button
            onClick={() => setShowSignOutModal(true)}
            style={{
              border: "1.5px solid #e2e8f0",
              borderRadius: 20,
              padding: "8px 18px",
              background: "#ffffff",
              color: "#475569",
              fontWeight: 500,
              fontSize: 17,
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </nav>
      </div>

      {mounted && showDrawer && createPortal((
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.4)",
            zIndex: 999,
          }}
          onClick={() => setShowDrawer(false)}
        >
          <div
            role="dialog"
            aria-label="Navigation drawer"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              right: 0,
              top: 0,
              height: "100%",
              width: 280,
              background: "#ffffff",
              borderLeft: "1px solid #e2e8f0",
              padding: 16,
              boxShadow: "-10px 0 24px rgba(2, 6, 23, 0.16)",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Navigation</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/feed" style={{ color: "#334155", textDecoration: "none", fontWeight: 600 }}>
                Feed
              </Link>
              <Link href={profileHref} style={{ color: "#334155", textDecoration: "none", fontWeight: 600 }}>
                Profile
              </Link>
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                style={{
                  marginTop: 10,
                  border: "1px solid #d1d5db",
                  background: "#f8fafc",
                  color: "#0f172a",
                  borderRadius: 8,
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontWeight: 600,
                  width: "fit-content",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ), document.body)}

      {mounted && showSignOutModal && createPortal((
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            zIndex: 1000,
          }}
          onClick={() => setShowSignOutModal(false)}
        >
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              maxWidth: 420,
              background: "#ffffff",
              borderRadius: 16,
              padding: 24,
              border: "1px solid #d1d5db",
              boxShadow: "0 16px 44px rgba(2, 6, 23, 0.35)",
              lineHeight: 1.5,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ color: "#111827", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              Sign out?
            </div>
            <p style={{ color: "#374151", fontSize: 15, margin: "0 0 18px" }}>
              You will be returned to the login page and need to sign in again to continue.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 10,
                  padding: "9px 14px",
                  background: "#f9fafb",
                  color: "#111827",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                style={{
                  border: "none",
                  borderRadius: 10,
                  padding: "9px 14px",
                  background: "#ef4444",
                  color: "#ffffff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      ), document.body)}
    </header>
  );
}
