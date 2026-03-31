"use client";
import React, { useEffect, useRef, useState } from "react";
import PostCard from "../posts/PostCard";
import { FeedResponse, PostResponse } from "../../types/post";

interface UserPostListProps {
  username: string;
  currentUserId: string;
}

const UserPostList: React.FC<UserPostListProps> = ({ username, currentUserId }) => {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/users/${encodeURIComponent(username)}/posts`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user posts");
        return res.json();
      })
      .then((data: FeedResponse) => {
        if (!mounted) return;
        setPosts(data.posts || []);
        setNextCursor(data.nextCursor || null);
      })
      .catch(() => {
        if (mounted) setError("Failed to fetch user posts");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [username]);

  const fetchMore = async () => {
    if (!nextCursor || loading) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/users/${encodeURIComponent(username)}/posts?cursor=${encodeURIComponent(nextCursor)}`
      );
      if (!res.ok) throw new Error("Failed to fetch more posts");
      const data: FeedResponse = await res.json();
      setPosts((prev) => [...prev, ...(data.posts || [])]);
      setNextCursor(data.nextCursor || null);
    } catch {
      setError("Failed to load more posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!nextCursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          fetchMore();
        }
      },
      { threshold: 1 }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextCursor, loading]);

  const handleDelete = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  if (!loading && posts.length === 0) {
    return <div style={{ color: "#94a3b8", textAlign: "center", padding: "24px 0" }}>No posts yet</div>;
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onDelete={handleDelete}
        />
      ))}

      <div ref={sentinelRef} />

      {nextCursor && !loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
          <button
            type="button"
            onClick={fetchMore}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 10,
              padding: "8px 12px",
              background: "#ffffff",
              color: "#334155",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Load more
          </button>
        </div>
      )}

      {loading && <div style={{ color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>Loading...</div>}
      {error && <div style={{ color: "#ef4444", textAlign: "center", padding: "8px 0" }}>{error}</div>}
      {!nextCursor && !loading && posts.length > 0 && (
        <div style={{ color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>You've reached the end</div>
      )}
    </div>
  );
};

export default UserPostList;
