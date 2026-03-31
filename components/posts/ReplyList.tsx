"use client";
import React from "react";
import { ReplyResponse } from "../../types/post";
import { formatTime } from "../../lib/formatTime";

interface ReplyListProps {
  replies: ReplyResponse[];
  loading?: boolean;
}

const ReplyList: React.FC<ReplyListProps> = ({ replies, loading = false }) => {
  if (loading) return <div style={{ color: '#64748b', fontSize: 14 }}>Loading replies...</div>;
  const safeReplies = Array.isArray(replies) ? replies : [];
  if (safeReplies.length === 0) return <div style={{ color: '#64748b', fontSize: 14 }}>No replies yet.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {safeReplies.map((reply) => (
        <div key={reply.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {reply.author.avatarUrl ? (
            <img
              src={reply.author.avatarUrl}
              alt={reply.author.displayName}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                objectFit: 'cover',
                background: '#64748b',
                marginRight: 0
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f1f5f9',
              fontWeight: 700,
              fontSize: 15
            }}>
              {reply.author.displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <div>
            <span style={{ fontWeight: 700, color: '#111827' }}>{reply.author.displayName}</span>
            <span style={{ marginLeft: 8, color: '#6b7280' }}>@{reply.author.username}</span>
            <span style={{ marginLeft: 8, color: '#9ca3af', fontSize: 13 }}>· {formatTime(reply.createdAt)}</span>
            <div style={{ color: '#111827', marginTop: 4, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{reply.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReplyList;
