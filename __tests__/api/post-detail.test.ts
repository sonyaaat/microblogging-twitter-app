/** @jest-environment node */

jest.mock("next-auth/next", () => ({ getServerSession: jest.fn() }));

jest.mock("../../lib/logger", () => ({
  logInfo: jest.fn(),
  logWarn: jest.fn(),
  logError: jest.fn(),
  logDebug: jest.fn(),
}));

let currentDb: any;

jest.mock("../../lib/db", () => ({
  readDb: jest.fn(() => currentDb),
  writeDb: jest.fn(() => undefined),
}));

import { getServerSession } from "next-auth/next";
import { GET, DELETE } from "../../app/api/posts/[postId]/route";

const makeDb = () => ({
  users: [
    { id: "u1", username: "alice", displayName: "Alice", avatarUrl: null },
    { id: "u2", username: "bob", displayName: "Bob", avatarUrl: null },
  ],
  posts: [{ id: "p1", content: "hi", authorId: "u1", createdAt: "2026-03-01T10:00:00.000Z" }],
  likes: [{ id: "l1", postId: "p1", userId: "u2", createdAt: "2026-03-01T11:00:00.000Z" }],
  replies: [{ id: "r1", postId: "p1", authorId: "u2", content: "hey", createdAt: "2026-03-01T12:00:00.000Z" }],
});

const withSession = (id?: string) => {
  (getServerSession as jest.Mock).mockResolvedValue(id ? { user: { id } } : null);
};

describe("/api/posts/[postId] handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentDb = makeDb();
  });

  it("GET returns 401 when no session", async () => {
    // targets: FM1
    withSession();
    const res = await GET({} as any, { params: Promise.resolve({ postId: "p1" }) });
    expect(res.status).toBe(401);
  });

  it("GET returns 404 when postId does not exist", async () => {
    // targets: FM2
    withSession("u1");
    const res = await GET({} as any, { params: Promise.resolve({ postId: "missing" }) });
    expect(res.status).toBe(404);
  });

  it("GET returns post with author, likeCount, replyCount", async () => {
    // targets: FM3
    withSession("u2");
    const res = await GET({} as any, { params: Promise.resolve({ postId: "p1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.id).toBe("p1");
    expect(body.author.username).toBe("alice");
    expect(body.likeCount).toBe(1);
    expect(body.replyCount).toBe(1);
  });

  it("DELETE returns 401 when no session", async () => {
    // targets: FM4
    withSession();
    const res = await DELETE({} as any, { params: Promise.resolve({ postId: "p1" }) });
    expect(res.status).toBe(401);
  });

  it("DELETE returns 403 when user is not the author", async () => {
    // targets: FM5
    withSession("u2");
    const res = await DELETE({} as any, { params: Promise.resolve({ postId: "p1" }) });
    expect(res.status).toBe(403);
  });

  it("DELETE returns 200 and removes post when user is the author", async () => {
    // targets: FM6
    withSession("u1");
    const res = await DELETE({} as any, { params: Promise.resolve({ postId: "p1" }) });
    expect(res.status).toBe(200);
    expect(currentDb.posts.find((p: any) => p.id === "p1")).toBeUndefined();
  });

  it("DELETE also removes associated likes and replies", async () => {
    // targets: FM7
    withSession("u1");
    await DELETE({} as any, { params: Promise.resolve({ postId: "p1" }) });
    expect(currentDb.likes.filter((l: any) => l.postId === "p1")).toEqual([]);
    expect(currentDb.replies.filter((r: any) => r.postId === "p1")).toEqual([]);
  });
});
