/** @jest-environment node */

jest.mock("next-auth/next", () => ({ getServerSession: jest.fn() }));

let currentDb: any;

jest.mock("../../lib/db", () => ({
  readDb: jest.fn(() => currentDb),
}));

import { getServerSession } from "next-auth/next";
import { GET } from "../../app/api/users/[username]/posts/route";

const withSession = (id?: string) => {
  (getServerSession as jest.Mock).mockResolvedValue(id ? { user: { id } } : null);
};

const makeDb = () => ({
  users: [
    { id: "u1", username: "alice", displayName: "Alice", avatarUrl: null },
    { id: "u2", username: "bob", displayName: "Bob", avatarUrl: null },
  ],
  posts: [
    { id: "p1", authorId: "u1", content: "older", createdAt: "2026-03-01T10:00:00.000Z" },
    { id: "p2", authorId: "u2", content: "other", createdAt: "2026-03-03T10:00:00.000Z" },
    { id: "p3", authorId: "u1", content: "newer", createdAt: "2026-03-02T10:00:00.000Z" },
  ],
  likes: [
    { id: "l1", postId: "p3", userId: "u2", createdAt: "2026-03-03T10:00:00.000Z" },
    { id: "l2", postId: "p1", userId: "u2", createdAt: "2026-03-03T10:00:00.000Z" },
  ],
  replies: [{ id: "r1", postId: "p3", authorId: "u2", content: "x", createdAt: "2026-03-03T10:00:00.000Z" }],
});

describe("/api/users/[username]/posts GET", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentDb = makeDb();
  });

  it("returns 401 when no session", async () => {
    // targets: FM1
    withSession();
    const res = await GET({ url: "http://localhost:3000/api/users/alice/posts" } as any, {
      params: Promise.resolve({ username: "alice" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 when username does not exist", async () => {
    // targets: FM2
    withSession("u1");
    const res = await GET({ url: "http://localhost:3000/api/users/missing/posts" } as any, {
      params: Promise.resolve({ username: "missing" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns posts for that user only sorted by createdAt DESC", async () => {
    // targets: FM3
    withSession("u2");
    const res = await GET({ url: "http://localhost:3000/api/users/alice/posts" } as any, {
      params: Promise.resolve({ username: "alice" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.posts.map((p: any) => p.id)).toEqual(["p3", "p1"]);
    expect(body.posts.every((p: any) => p.author.username === "alice")).toBe(true);
  });
});
