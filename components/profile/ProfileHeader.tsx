"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

interface ProfileData {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  postCount: number;
  likeCount: number;
}

interface ProfileHeaderProps {
  initialProfile: ProfileData;
  isOwnProfile: boolean;
}

const getInitials = (displayName: string) =>
  displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const isRenderableAvatar = (avatarUrl: string | null | undefined) => {
  if (!avatarUrl) return false;
  const value = avatarUrl.trim();
  if (!value) return false;
  if (value.startsWith("data:")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ initialProfile, isOwnProfile }) => {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState(initialProfile.displayName);
  const [bio, setBio] = useState(initialProfile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl ?? "");
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [profileAvatarLoadError, setProfileAvatarLoadError] = useState(false);
  const [modalAvatarLoadError, setModalAvatarLoadError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedAvatarPreview = useMemo(() => {
    if (!selectedAvatarFile) return null;
    return URL.createObjectURL(selectedAvatarFile);
  }, [selectedAvatarFile]);

  useEffect(() => {
    return () => {
      if (selectedAvatarPreview) URL.revokeObjectURL(selectedAvatarPreview);
    };
  }, [selectedAvatarPreview]);

  useEffect(() => {
    setProfileAvatarLoadError(false);
  }, [profile.avatarUrl]);

  const openEditModal = () => {
    setDisplayName(profile.displayName);
    setBio(profile.bio ?? "");
    setAvatarUrl(profile.avatarUrl ?? "");
    setSelectedAvatarFile(null);
    setModalAvatarLoadError(false);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let nextAvatarUrl = profile.avatarUrl;

      if (!selectedAvatarFile) {
        nextAvatarUrl = avatarUrl.trim() || null;
      }

      if (selectedAvatarFile) {
        const formData = new FormData();
        formData.append("avatar", selectedAvatarFile);

        const uploadRes = await fetch(`/api/users/${profile.username}/avatar`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setError(uploadData.error || "Failed to upload avatar");
          return;
        }

        nextAvatarUrl = uploadData.avatarUrl;
      }

      const res = await fetch(`/api/users/${profile.username}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          bio,
          avatarUrl: nextAvatarUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update profile");
        return;
      }

      setProfile(data);
      setSelectedAvatarFile(null);
      setModalAvatarLoadError(false);
      setIsModalOpen(false);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 24,
      overflow: "hidden",
      border: "1px solid #e2e8f0",
      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      marginBottom: 20,
    }}>
      <div
        style={{
          height: 140,
          background: "linear-gradient(90deg, #3b82f6, #ec4899)",
        }}
      />

      <div style={{ padding: "0 24px 24px", position: "relative" }}>
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            border: "4px solid #ffffff",
            marginTop: -45,
            background: "linear-gradient(135deg, #3b82f6, #ec4899)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 30,
          }}
        >
          {isRenderableAvatar(profile.avatarUrl) && !profileAvatarLoadError ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={() => setProfileAvatarLoadError(true)}
            />
          ) : (
            getInitials(profile.displayName)
          )}
        </div>

        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ color: "#1e293b", fontSize: 22, fontWeight: 700 }}>{profile.displayName}</div>
            <div style={{ color: "#94a3b8", fontSize: 15 }}>@{profile.username}</div>
          </div>
          {isOwnProfile && (
            <button
              onClick={openEditModal}
              style={{
                background: "linear-gradient(90deg, #3b82f6, #ec4899)",
                color: "#fff",
                border: "none",
                borderRadius: 24,
                padding: "10px 24px",
                fontWeight: 600,
                cursor: "pointer",
                height: 44,
              }}
            >
              Edit Profile
            </button>
          )}
        </div>

        {profile.bio && <p style={{ color: "#475569", marginTop: 8, fontSize: 15 }}>{profile.bio}</p>}

        <div style={{ color: "#64748b", marginTop: 12, fontSize: 14 }}>
          <span style={{ color: "#1e293b", fontWeight: 700 }}>{profile.postCount}</span> Posts · <span style={{ color: "#1e293b", fontWeight: 700 }}>{profile.likeCount}</span> Likes received
        </div>
      </div>

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
          }}
          onClick={() => !loading && setIsModalOpen(false)}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              background: "#111827",
              border: "1px solid #334155",
              borderRadius: 14,
              padding: 22,
            }}
          >
            <h3 style={{ color: "#f8fafc", marginBottom: 16, fontSize: 24, lineHeight: 1.25 }}>Edit Profile</h3>

            <label style={{ color: "#cbd5e1", fontSize: 15, fontWeight: 600, display: "block", marginBottom: 8 }}>
              Avatar
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#ffffff",
                  background: "linear-gradient(135deg, #3b82f6, #ec4899)",
                  border: "2px solid #334155",
                  flexShrink: 0,
                }}
              >
                {selectedAvatarPreview ? (
                  <img
                    src={selectedAvatarPreview}
                    alt="Selected avatar preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : isRenderableAvatar(profile.avatarUrl) && !modalAvatarLoadError ? (
                  <img
                    src={profile.avatarUrl ?? ""}
                    alt={profile.displayName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={() => setModalAvatarLoadError(true)}
                  />
                ) : (
                  getInitials(displayName || profile.displayName)
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                disabled={loading}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (!file) {
                    setSelectedAvatarFile(null);
                    return;
                  }

                  if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
                    setError("Unsupported file type. Use jpeg, png, gif, or webp.");
                    e.currentTarget.value = "";
                    return;
                  }

                  if (file.size > 2 * 1024 * 1024) {
                    setError("File is too large. Max size is 2MB.");
                    e.currentTarget.value = "";
                    return;
                  }

                  setError(null);
                  setSelectedAvatarFile(file);
                }}
                style={{
                  display: "none",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: "#ffffff",
                    color: "#111827",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    width: "fit-content",
                  }}
                >
                  Choose file
                </button>
                <span style={{ color: "#94a3b8", fontSize: 14 }}>
                  {selectedAvatarFile ? selectedAvatarFile.name : "No file selected"}
                </span>
              </div>
            </div>

            <label htmlFor="profile-displayName" style={{ color: "#cbd5e1", fontSize: 15, fontWeight: 600, display: "block", marginBottom: 8 }}>
              Display Name
            </label>
            <input
              id="profile-displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              disabled={loading}
              style={{
                width: "100%",
                marginBottom: 12,
                background: "#0f172a",
                color: "#f8fafc",
                border: "1px solid #334155",
                borderRadius: 10,
                padding: "11px 12px",
                fontSize: 16,
              }}
            />

            <label htmlFor="profile-bio" style={{ color: "#cbd5e1", fontSize: 15, fontWeight: 600, display: "block", marginBottom: 8 }}>
              Bio
            </label>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              disabled={loading}
              style={{
                width: "100%",
                marginBottom: 12,
                background: "#0f172a",
                color: "#f8fafc",
                border: "1px solid #334155",
                borderRadius: 10,
                padding: "11px 12px",
                fontSize: 16,
                lineHeight: 1.5,
                resize: "vertical",
              }}
            />

            <label htmlFor="profile-avatarUrl" style={{ color: "#cbd5e1", fontSize: 15, fontWeight: 600, display: "block", marginBottom: 8 }}>
              Avatar URL
            </label>
            <input
              id="profile-avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              disabled={loading || !!selectedAvatarFile}
              placeholder="https://example.com/avatar.png"
              style={{
                width: "100%",
                marginBottom: 12,
                background: "#0f172a",
                color: "#f8fafc",
                border: "1px solid #334155",
                borderRadius: 10,
                padding: "11px 12px",
                fontSize: 16,
              }}
            />

            {error && <div style={{ color: "#ef4444", marginBottom: 12, fontSize: 15 }}>{error}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
                style={{
                  background: "#1f2937",
                  color: "#e5e7eb",
                  border: "1px solid #334155",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: "linear-gradient(90deg, #2563eb, #ec4899)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
