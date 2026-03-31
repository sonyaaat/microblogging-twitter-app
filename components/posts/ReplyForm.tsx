"use client";
import React, { useState } from "react";
import { ReplyResponse } from "../../types/post";

interface ReplyFormProps {
  postId: string;
  onReplyCreated?: (reply: ReplyResponse) => void;
}

const MAX_LENGTH = 280;

const ReplyForm: React.FC<ReplyFormProps> = ({ postId, onReplyCreated }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Reply cannot be empty");
      return;
    }
    if (content.length > MAX_LENGTH) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to reply");
      } else {
        const createdReply = await res.json();
        setContent("");
        if (onReplyCreated) onReplyCreated(createdReply);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
      <textarea
        style={{
          width: '100%',
          background: '#f1f5f9',
          color: '#111827',
          borderRadius: 12,
          padding: 10,
          resize: 'none',
          outline: 'none',
          border: '1px solid #e5e7eb',
          fontSize: 15,
          fontFamily: 'inherit',
          marginBottom: 4
        }}
        rows={2}
        maxLength={MAX_LENGTH}
        placeholder="Write a reply..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 12, color: content.length > 260 ? '#ef4444' : '#64748b' }}>{content.length} / {MAX_LENGTH}</span>
        <button
          type="submit"
          style={{
            background: 'linear-gradient(90deg, #3b82f6, #ec4899)',
            color: '#fff',
            padding: '4px 14px',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 13,
            border: 'none',
            opacity: loading || !content.trim() || content.length > MAX_LENGTH ? 0.5 : 1,
            cursor: loading || !content.trim() || content.length > MAX_LENGTH ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s'
          }}
          disabled={loading || !content.trim() || content.length > MAX_LENGTH}
        >
          {loading ? "Replying..." : "Reply"}
        </button>
      </div>
      {error && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{error}</div>}
    </form>
  );
};

export default ReplyForm;
