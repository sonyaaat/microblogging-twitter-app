
"use client";
import React, { useState } from "react";

interface PostFormProps {
  onPostCreated: ((post: any) => void) | null;
}

const MAX_LENGTH = 280;

const PostForm: React.FC<PostFormProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > MAX_LENGTH) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to post");
      } else {
        const post = await res.json();
        setContent("");
        if (onPostCreated) onPostCreated(post);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)',
        padding: 20,
        marginBottom: 24,
        border: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          padding: 1,
          borderRadius: 12,
          background: focused ? 'linear-gradient(90deg, #3b82f6, #ec4899)' : '#e5e7eb',
          marginBottom: 8,
          transition: 'background 0.15s ease',
        }}
      >
        <textarea
          style={{
            display: 'block',
            width: '100%',
            boxSizing: 'border-box',
            background: '#f3f4f6',
            color: '#111827',
            borderRadius: 11,
            padding: 14,
            resize: 'none',
            outline: 'none',
            border: 'none',
            fontSize: 16,
          }}
          rows={3}
          maxLength={MAX_LENGTH}
          placeholder="What's happening?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={loading}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 14, color: content.length > 260 ? '#ec4899' : '#6b7280' }}>{content.length} / {MAX_LENGTH}</span>
        <button
          type="submit"
          style={{
            background: 'linear-gradient(90deg, #3b82f6, #ec4899)',
            color: '#fff',
            padding: '8px 20px',
            borderRadius: 12,
            fontWeight: 600,
            border: 'none',
            opacity: loading || !content.trim() || content.length > MAX_LENGTH ? 0.5 : 1,
            cursor: loading || !content.trim() || content.length > MAX_LENGTH ? 'not-allowed' : 'pointer',
            fontSize: 16,
          }}
          disabled={loading || !content.trim() || content.length > MAX_LENGTH}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
      {error && <div style={{ color: '#ef4444', fontSize: 14, marginTop: 8 }}>{error}</div>}
    </form>
  );
};

export default PostForm;
