/** @jest-environment node */

jest.mock("next-auth/next", () => ({ getServerSession: jest.fn() }));

jest.mock("../../lib/logger", () => ({
  logInfo: jest.fn(),
  logWarn: jest.fn(),
  logError: jest.fn(),
  logDebug: jest.fn(),
}));

let currentDb: any;
let idCounter = 0;

jest.mock("../../lib/db", () => ({
  readDb: jest.fn(() => currentDb),
  writeDb: jest.fn(() => undefined),
  generateId: jest.fn(() => `like-${++idCounter}`),
}));

import { getServerSession } from "next-auth/next";
import { POST } from "../../app/api/posts/[postId]/like/route";

const withSession = (id?: string) => {
  (getServerSession as jest.Mock).mockResolvedValue(id ? { user: { id } } : null);
};

const makeDb = () => ({
  users: [{ id: "u1" }, { id: "u2" }],
  posts: [{ id: "p1", content: "post", authorId: "u1", createdAt: "2026-01-01T00:00:00.000Z" }],
  likes: [] as any[],
  replies: [],
});

describe("/api/posts/[postId]/like POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    idCounter = 0;
    currentDb = makeDb();
  });

  it("returns 401 when no session", async () => {
    // targets: FM1
    withSession();
    const res = await POST({} as any, { params: Promise.resolve({ postId: "p1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when post does not exist", async () => {
    // targets: FM2
    withSession("u1");
    const res = await POST({} as any, { params: Promise.resolve({ postId: "missing" }) });
    expect(res.status).toBe(404);
  });

  it("creates a like when none exists", async () => {
    // targets: FM3
    withSession("u1");
    const res = await POST({} as any, { params: Promise.resolve({ postId: "p1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ liked: true, likeCount: 1 });
    expect(currentDb.likes).toHaveLength(1);
  });

  it("removes a like when one exists", async () => {
    // targets: FM4
    currentDb.likes.push({ id: "l1", postId: "p1", userId: "u1", createdAt: "2026-01-01T00:00:00.000Z" });
    withSession("u1");

    const res = await POST({} as any, { params: Promise.resolve({ postId: "p1" }) });
    const body = await res.json();

    expect(body).toEqual({ liked: false, likeCount: 0 });
    expect(currentDb.likes).toHaveLength(0);
  });

  it("does not create duplicate likes", async () => {
    // targets: FM5
    withSession("u1");
    await POST({} as any, { params: Promise.resolve({ postId: "p1" }) }); // like
    await POST({} as any, { params: Promise.resolve({ postId: "p1" }) }); // unlike
    await POST({} as any, { params: Promise.resolve({ postId: "p1" }) }); // like again

    const userLikes = currentDb.likes.filter((l: any) => l.userId === "u1" && l.postId === "p1");
    expect(userLikes).toHaveLength(1);
  });
});
