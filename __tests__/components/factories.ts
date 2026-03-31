import { PostResponse, ReplyResponse } from "../../types/post";

export const makeUser = (overrides: Record<string, any> = {}) => ({
  id: "user-1",
  email: "alice@example.com",
  username: "alice",
  displayName: "Alice Doe",
  bio: "Hello there",
  avatarUrl: "https://example.com/avatar.png",
  createdAt: "2026-03-31T10:00:00.000Z",
  postCount: 3,
  likeCount: 9,
  ...overrides,
});

export const makePost = (overrides: Partial<PostResponse> = {}): PostResponse => ({
  id: "post-1",
  content: "Hello microblog",
  author: {
    id: "user-1",
    username: "alice",
    displayName: "Alice Doe",
    avatarUrl: "https://example.com/avatar.png",
  },
  createdAt: "2026-03-31T10:00:00.000Z",
  likeCount: 2,
  replyCount: 1,
  likedByCurrentUser: false,
  ...overrides,
});

export const makeReply = (overrides: Partial<ReplyResponse> = {}): ReplyResponse => ({
  id: "reply-1",
  content: "A reply",
  author: {
    id: "user-2",
    username: "bob",
    displayName: "Bob Smith",
    avatarUrl: null,
  },
  createdAt: "2026-03-31T10:10:00.000Z",
  ...overrides,
});
