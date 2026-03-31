"use client";
import React, { useEffect, useRef, useState } from "react";
import PostCard from "./PostCard";
import { PostResponse, FeedResponse } from "../../types/post";

interface FeedListProps {
  currentUserId: string;
}

import PostForm from "./PostForm";

const FeedList: React.FC<FeedListProps> = ({ currentUserId }) => {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Initial fetch
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/posts")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch feed");
        return res.json();
      })
      .then((data: FeedResponse) => {
        if (mounted) {
          setPosts(data.posts);
          setNextCursor(data.nextCursor);
        }
      })
      .catch(() => {
        if (mounted) setError("Failed to fetch feed");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!nextCursor) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          fetchMore();
        }
      },
      { threshold: 1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line
  }, [nextCursor, loading]);

  const fetchMore = async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts?cursor=${encodeURIComponent(nextCursor)}`);
      if (!res.ok) throw new Error("Failed to load more posts");
      const data: FeedResponse = await res.json();
      setPosts((prev) => [...prev, ...data.posts]);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError("Failed to load more posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div style={{ width: '100%', maxWidth: 680, margin: '0 auto' }}>
      <PostForm onPostCreated={(post) => setPosts((prev) => [post, ...prev])} />
      {posts.length === 0 ? (
        <div style={{ color: '#9ca3af', textAlign: 'center', padding: '48px 0' }}>No posts yet — be the first!</div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={currentUserId} onDelete={handleDelete} />
        ))
      )}
      <div ref={sentinelRef} />
      {nextCursor && !loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
          <button
            type="button"
            onClick={fetchMore}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: 10,
              padding: '8px 12px',
              background: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Load more
          </button>
        </div>
      )}
      {loading && <div style={{ color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>Loading...</div>}
      {error && <div style={{ color: '#ef4444', textAlign: 'center', padding: '8px 0' }}>{error}</div>}
      {!nextCursor && !loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '16px 0',
            fontWeight: 600,
            background: 'linear-gradient(90deg, #3b82f6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          You've reached the end
        </div>
      )}
    </div>
  );
};

export default FeedList;
