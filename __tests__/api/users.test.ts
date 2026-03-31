/** @jest-environment node */

jest.mock("next-auth/next", () => ({ getServerSession: jest.fn() }));

jest.mock("../../lib/db", () => ({
  readDb: jest.fn(() => currentDb),
  writeDb: jest.fn(() => undefined),
}));

let currentDb: any;

import { getServerSession } from "next-auth/next";
import { GET, PATCH } from "../../app/api/users/[username]/route";

const withSession = (id?: string) => {
  (getServerSession as jest.Mock).mockResolvedValue(id ? { user: { id } } : null);
};

const makeDb = () => ({
  users: [
    {
      id: "u1",
      username: "alice",
      displayName: "Alice",
      bio: "bio",
      avatarUrl: null,
      createdAt: "2026-03-01T00:00:00.000Z",
    },
    {
      id: "u2",
      username: "bob",
      displayName: "Bob",
      bio: null,
      avatarUrl: null,
      createdAt: "2026-03-02T00:00:00.000Z",
    },
  ],
  posts: [
    { id: "p1", authorId: "u1", content: "a", createdAt: "2026-03-03T00:00:00.000Z" },
    { id: "p2", authorId: "u1", content: "b", createdAt: "2026-03-04T00:00:00.000Z" },
    { id: "p3", authorId: "u2", content: "c", createdAt: "2026-03-04T00:00:00.000Z" },
  ],
  likes: [
    { id: "l1", postId: "p1", userId: "u2", createdAt: "2026-03-04T00:00:00.000Z" },
    { id: "l2", postId: "p2", userId: "u2", createdAt: "2026-03-04T00:00:00.000Z" },
    { id: "l3", postId: "p3", userId: "u1", createdAt: "2026-03-04T00:00:00.000Z" },
  ],
  replies: [],
});

describe("/api/users/[username] handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentDb = makeDb();
  });

  it("GET returns 401 when no session", async () => {
    // targets: FM1
    withSession();
    const res = await GET({} as any, { params: Promise.resolve({ username: "alice" }) });
    expect(res.status).toBe(401);
  });

  it("GET returns 404 when username does not exist", async () => {
    // targets: FM2
    withSession("u1");
    const res = await GET({} as any, { params: Promise.resolve({ username: "missing" }) });
    expect(res.status).toBe(404);
  });

  it("GET returns profile with correct postCount and likeCount", async () => {
    // targets: FM3
    withSession("u2");
    const res = await GET({} as any, { params: Promise.resolve({ username: "alice" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.postCount).toBe(2);
    expect(body.likeCount).toBe(2);
  });

  it("PATCH returns 401 when no session", async () => {
    // targets: FM4
    withSession();
    const req = { json: async () => ({ displayName: "Alice 2" }) } as any;
    const res = await PATCH(req, { params: Promise.resolve({ username: "alice" }) });
    expect(res.status).toBe(401);
  });

  it("PATCH returns 403 when editing another user profile", async () => {
    // targets: FM5
    withSession("u2");
    const req = { json: async () => ({ displayName: "Alice 2" }) } as any;
    const res = await PATCH(req, { params: Promise.resolve({ username: "alice" }) });
    expect(res.status).toBe(403);
  });

  it("PATCH returns 400 when displayName exceeds 50 chars", async () => {
    // targets: FM6
    withSession("u1");
    const req = { json: async () => ({ displayName: "a".repeat(51) }) } as any;
    const res = await PATCH(req, { params: Promise.resolve({ username: "alice" }) });
    expect(res.status).toBe(400);
  });

  it("PATCH returns 400 when bio exceeds 160 chars", async () => {
    // targets: FM7
    withSession("u1");
    const req = { json: async () => ({ bio: "a".repeat(161) }) } as any;
    const res = await PATCH(req, { params: Promise.resolve({ username: "alice" }) });
    expect(res.status).toBe(400);
  });

  it("PATCH returns 200 with updated profile when valid", async () => {
    // targets: FM8
    withSession("u1");
    const req = { json: async () => ({ displayName: "Alice Updated", bio: "new bio" }) } as any;
    const res = await PATCH(req, { params: Promise.resolve({ username: "alice" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.displayName).toBe("Alice Updated");
    expect(body.bio).toBe("new bio");
    expect(currentDb.users.find((u: any) => u.id === "u1").displayName).toBe("Alice Updated");
  });
});
