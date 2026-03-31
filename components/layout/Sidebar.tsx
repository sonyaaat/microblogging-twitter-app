"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface SidebarProps {
  username: string;
  displayName: string;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function Sidebar({ username, displayName }: SidebarProps) {
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isDesktop) return null;

  const profileHref = `/profile/${encodeURIComponent(username)}`;
  const feedActive = pathname === "/feed";
  const profileActive = pathname?.startsWith("/profile/");

  return (
    <div style={{ width: 256, flexShrink: 0 }}>
      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: 256,
          background: "#0b1220",
          borderRight: "1px solid #1e293b",
          padding: 18,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 30,
        }}
      >
        <div>
          <div style={{ color: "#60a5fa", fontWeight: 800, fontSize: 24, marginBottom: 18 }}>Microlog</div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link
              href="/feed"
              style={{
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: 10,
                background: feedActive ? "#3b82f6" : "transparent",
                color: "#f8fafc",
                fontWeight: 600,
              }}
            >
              Feed
            </Link>
            <Link
              href={profileHref}
              style={{
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: 10,
                background: profileActive ? "#3b82f6" : "transparent",
                color: "#f8fafc",
                fontWeight: 600,
              }}
            >
              Profile
            </Link>
          </nav>
        </div>

        <div style={{ borderTop: "1px solid #1e293b", paddingTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #ec4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              {getInitials(displayName)}
            </div>
            <div>
              <div style={{ color: "#f8fafc", fontWeight: 600, fontSize: 14 }}>{displayName}</div>
              <div style={{ color: "#94a3b8", fontSize: 13 }}>@{username}</div>
            </div>
          </div>

          <button
            onClick={() => setShowSignOutModal(true)}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 10,
              padding: "9px 10px",
              background: "#1e293b",
              color: "#f8fafc",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>

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
      </aside>
    </div>
  );
}
