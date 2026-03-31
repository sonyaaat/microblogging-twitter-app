/** @jest-environment node */

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

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
  generateId: jest.fn(() => "generated-post-id"),
}));

import { getServerSession } from "next-auth/next";
import { GET, POST } from "../../app/api/posts/route";

const mockSession = (userId?: string) => {
  (getServerSession as jest.Mock).mockResolvedValue(
    userId ? { user: { id: userId } } : null
  );
};

const makeDb = () => ({
  users: [
    { id: "u1", username: "alice", displayName: "Alice", avatarUrl: null, email: "a@a.com" },
    { id: "u2", username: "bob", displayName: "Bob", avatarUrl: null, email: "b@b.com" },
  ],
  posts: [
    { id: "p1", content: "older", authorId: "u1", createdAt: "2026-03-01T10:00:00.000Z" },
    { id: "p2", content: "newest", authorId: "u2", createdAt: "2026-03-02T10:00:00.000Z" },
    { id: "p3", content: "middle", authorId: "u1", createdAt: "2026-03-01T12:00:00.000Z" },
  ],
  likes: [{ id: "l1", postId: "p2", userId: "u1", createdAt: "2026-03-02T11:00:00.000Z" }],
  replies: [{ id: "r1", postId: "p2", authorId: "u1", content: "yo", createdAt: "2026-03-02T12:00:00.000Z" }],
});

describe("/api/posts route handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentDb = makeDb();
  });

  it("GET returns 401 when no session", async () => {
    // targets: FM1
    mockSession();
    const req = { url: "http://localhost:3000/api/posts" } as any;
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("GET returns paginated posts sorted by createdAt DESC", async () => {
    // targets: FM2
    mockSession("u1");
    const req = { url: "http://localhost:3000/api/posts?limit=2" } as any;
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.posts.map((p: any) => p.id)).toEqual(["p2", "p3"]);
    expect(body.nextCursor).toBeTruthy();
  });

  it("GET returns empty posts array when no posts exist", async () => {
    // targets: FM3
    mockSession("u1");
    currentDb.posts = [];
    const req = { url: "http://localhost:3000/api/posts" } as any;
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.posts).toEqual([]);
    expect(body.nextCursor).toBeNull();
  });

  it("GET respects cursor and limit query params", async () => {
    // targets: FM4
    mockSession("u1");
    const firstRes = await GET({ url: "http://localhost:3000/api/posts?limit=1" } as any);
    const firstBody = await firstRes.json();
    const cursor = firstBody.nextCursor;

    const secondRes = await GET({ url: `http://localhost:3000/api/posts?limit=1&cursor=${encodeURIComponent(cursor)}` } as any);
    const secondBody = await secondRes.json();

    expect(secondBody.posts).toHaveLength(1);
    expect(secondBody.posts[0].id).toBe("p3");
  });

  it("POST returns 401 when no session", async () => {
    // targets: FM5
    mockSession();
    const req = { json: async () => ({ content: "hello" }) } as any;
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("POST returns 400 when content is empty", async () => {
    // targets: FM6
    mockSession("u1");
    const req = { json: async () => ({ content: "   " }) } as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("POST returns 400 when content exceeds 280 characters", async () => {
    // targets: FM7
    mockSession("u1");
    const req = { json: async () => ({ content: "a".repeat(281) }) } as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("POST returns 201 with created post when valid", async () => {
    // targets: FM8
    mockSession("u1");
    const req = { json: async () => ({ content: "valid post" }) } as any;
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).toBe("generated-post-id");
    expect(body.content).toBe("valid post");
    expect(body.author.id).toBe("u1");
  });

  it("POST writes created post with correct authorId in db", async () => {
    // targets: FM9
    mockSession("u2");
    const req = { json: async () => ({ content: "db check" }) } as any;
    await POST(req);

    const created = currentDb.posts.find((p: any) => p.id === "generated-post-id");
    expect(created).toBeTruthy();
    expect(created.authorId).toBe("u2");
  });
});
