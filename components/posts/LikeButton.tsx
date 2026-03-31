"use client";
import React, { useState } from "react";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialLikeCount: number;
}

const LikeButton: React.FC<LikeButtonProps> = ({ postId, initialLiked, initialLikeCount }) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (!res.ok) {
        setLiked(prevLiked);
        setLikeCount(prevCount);
        setError("Failed to update like");
      } else {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      }
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: "none",
        border: "none",
        padding: "2px 4px",
        borderRadius: 8,
        color: liked ? "#ef4444" : "#64748b",
        cursor: loading ? "not-allowed" : "pointer",
        outline: "none",
        fontWeight: 500,
        fontSize: 15,
        opacity: loading ? 0.6 : 1,
        transition: "color 0.2s, box-shadow 0.2s",
        boxShadow: liked ? "0 0 8px rgba(236,72,153,0.3)" : "none",
      }}
      onClick={handleLike}
      disabled={loading}
      aria-pressed={liked}
      title={liked ? "Unlike" : "Like"}
    >
      <svg
        width="20"
        height="20"
        fill={liked ? "#ef4444" : "none"}
        stroke="#ef4444"
        viewBox="0 0 24 24"
        style={{
          display: "inline-block",
          verticalAlign: "middle",
          marginRight: 4,
          transition: "fill 0.2s"
        }}
      >
        <path
          d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12 4.5 12 4.5C12 4.5 12.76 3 14.5 3C17.58 3 20 5.42 20 8.5C20 13.5 12 21 12 21Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{ marginRight: 2 }}>{likeCount}</span>
      {error && (
        <span style={{ marginLeft: 8, fontSize: 12, color: "#ef4444" }}>{error}</span>
      )}
    </button>
  );
};

export default LikeButton;
