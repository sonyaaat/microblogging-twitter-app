"use client";
import React, { useEffect, useState } from "react";
import { PostResponse, ReplyResponse } from "../../types/post";
import LikeButton from "./LikeButton";
import ReplyList from "./ReplyList";
import ReplyForm from "./ReplyForm";
import { formatTime } from "../../lib/formatTime";

interface PostCardProps {
  post: PostResponse;
  currentUserId: string;
  onDelete?: (postId: string) => void;
}

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

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onDelete }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replyCount, setReplyCount] = useState(post.replyCount);
  const [replies, setReplies] = useState<ReplyResponse[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [post.author.avatarUrl, post.id]);

  useEffect(() => {
    if (!showReplies || repliesLoaded) return;

    const fetchReplies = async () => {
      setLoadingReplies(true);
      try {
        const res = await fetch(`/api/posts/${post.id}/replies`);
        const data = await res.json();
        const normalizedReplies = Array.isArray(data)
          ? data
          : Array.isArray(data?.replies)
            ? data.replies
            : [];

        setReplies(normalizedReplies);
        setReplyCount(normalizedReplies.length);
      } catch {
        setReplies([]);
      } finally {
        setLoadingReplies(false);
        setRepliesLoaded(true);
      }
    };

    fetchReplies();
  }, [showReplies, repliesLoaded, post.id]);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (res.ok && onDelete) onDelete(post.id);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const initials = post.author.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: '#fff',
        borderRadius: 18,
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.10)' : '0 2px 12px rgba(0,0,0,0.06)',
        padding: 24,
        marginBottom: 24,
        border: '1px solid #e5e7eb',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 12,
          bottom: 12,
          width: 3,
          borderRadius: 999,
          background: 'linear-gradient(180deg, #3b82f6, #ec4899)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        {isRenderableAvatar(post.author.avatarUrl) && !avatarLoadError ? (
          <img
            src={post.author.avatarUrl}
            alt={post.author.displayName}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              objectFit: 'cover',
              background: '#e0e7ef',
              marginRight: 14,
              outline: '2px solid white',
              outlineOffset: 2,
            }}
            onError={() => setAvatarLoadError(true)}
          />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
              marginRight: 14,
              border: '2px solid #fff',
              boxShadow: '0 2px 8px 0 rgba(59,130,246,0.08)',
              outline: '2px solid white',
              outlineOffset: 2,
            }}
          >
            {initials}
          </div>
        )}
        <div>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{post.author.displayName}</span>
          <span style={{ marginLeft: 8, color: '#94a3b8', fontSize: 14 }}>@{post.author.username}</span>
          <span style={{ marginLeft: 8, color: '#94a3b8', fontSize: 14 }}>· {formatTime(post.createdAt)}</span>
        </div>
      </div>
      <div
        style={{
          height: 1,
          background: 'linear-gradient(90deg, rgba(59,130,246,0.55), rgba(236,72,153,0.55))',
          marginBottom: 14,
        }}
      />
      <div style={{ color: '#1e293b', fontSize: 16, lineHeight: 1.6, marginBottom: 16, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{post.content}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, color: '#6b7280' }}>
        <LikeButton
          postId={post.id}
          initialLiked={post.likedByCurrentUser}
          initialLikeCount={post.likeCount}
        />
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 15
          }}
          onClick={() => setShowReplies((v) => !v)}
          aria-expanded={showReplies}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path stroke="#3b82f6" strokeWidth="2" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{replyCount}</span>
        </button>
        {currentUserId === post.author.id && (
          <button
            style={{
              marginLeft: 'auto', color: '#ef4444', background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', fontWeight: 500
            }}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </button>
        )}
      </div>
      {showReplies && (
        <div style={{ marginTop: 16 }}>
          <ReplyList replies={replies} loading={loadingReplies} />
          <ReplyForm
            postId={post.id}
            onReplyCreated={(newReply) => {
              setReplies((prev) => [...prev, newReply]);
              setReplyCount((count) => count + 1);
              setRepliesLoaded(true);
            }}
          />
        </div>
      )}

      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 380,
              background: "#ffffff",
              borderRadius: 14,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              padding: 20,
              border: "1px solid #e5e7eb",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, color: "#111827", fontSize: 20, fontWeight: 700 }}>Delete Post?</h3>
            <p style={{ margin: "10px 0 18px", color: "#4b5563", fontSize: 14 }}>
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                style={{
                  background: "#e5e7eb",
                  color: "#111827",
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontWeight: 600,
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  background: "#ef4444",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontWeight: 600,
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
