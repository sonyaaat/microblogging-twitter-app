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
import { GET, POST } from "../../app/api/posts/[postId]/replies/route";

const withSession = (id?: string) => {
  (getServerSession as jest.Mock).mockResolvedValue(id ? { user: { id } } : null);
};

const makeDb = () => ({
  users: [
    { id: "u1", username: "alice", displayName: "Alice", avatarUrl: null },
    { id: "u2", username: "bob", displayName: "Bob", avatarUrl: null },
  ],
  posts: [{ id: "p1", content: "post", authorId: "u1", createdAt: "2026-03-01T10:00:00.000Z" }],
  likes: [],
  replies: [
    { id: "r2", postId: "p1", authorId: "u2", content: "later", createdAt: "2026-03-01T12:00:00.000Z" },
    { id: "r1", postId: "p1", authorId: "u1", content: "first", createdAt: "2026-03-01T11:00:00.000Z" },
  ],
});

describe("/api/posts/[postId]/replies handlers", () => {
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

  it("GET returns 404 when post does not exist", async () => {
    // targets: FM2
    withSession("u1");
    const res = await GET({} as any, { params: Promise.resolve({ postId: "missing" }) });
    expect(res.status).toBe(404);
  });

  it("GET returns replies sorted by createdAt ASC", async () => {
    // targets: FM3
    withSession("u1");
    const res = await GET({} as any, { params: Promise.resolve({ postId: "p1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.map((r: any) => r.id)).toEqual(["r1", "r2"]);
  });

  it("GET returns empty array when no replies exist", async () => {
    // targets: FM4
    withSession("u1");
    currentDb.replies = [];
    const res = await GET({} as any, { params: Promise.resolve({ postId: "p1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("POST returns 401 when no session", async () => {
    // targets: FM5
    withSession();
    const req = { json: async () => ({ content: "reply" }) } as any;
    const res = await POST(req, { params: Promise.resolve({ postId: "p1" }) });
    expect(res.status).toBe(401);
  });

  it("POST returns 404 when post does not exist", async () => {
    // targets: FM6
    withSession("u1");
    const req = { json: async () => ({ content: "reply" }) } as any;
    const res = await POST(req, { params: Promise.resolve({ postId: "missing" }) });
    expect(res.status).toBe(404);
  });

  it("POST returns 400 when content is empty", async () => {
    // targets: FM7
    withSession("u1");
    const req = { json: async () => ({ content: "   " }) } as any;
    const res = await POST(req, { params: Promise.resolve({ postId: "p1" }) });
    expect(res.status).toBe(400);
  });

  it("POST returns 400 when content exceeds 280 chars", async () => {
    // targets: FM8
    withSession("u1");
    const req = { json: async () => ({ content: "a".repeat(281) }) } as any;
    const res = await POST(req, { params: Promise.resolve({ postId: "p1" }) });
    expect(res.status).toBe(400);
  });

  it("POST returns 201 with created reply when valid", async () => {
    // targets: FM9
    withSession("u1");
    const req = { json: async () => ({ content: "new reply" }) } as any;
    const res = await POST(req, { params: Promise.resolve({ postId: "p1" }) });
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.content).toBe("new reply");
    expect(currentDb.replies.some((r: any) => r.content === "new reply" && r.postId === "p1")).toBe(true);
  });
});
