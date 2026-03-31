/** @jest-environment node */

jest.mock("next-auth/next", () => ({ getServerSession: jest.fn() }));

let currentDb: any;

jest.mock("../../lib/db", () => ({
  readDb: jest.fn(() => currentDb),
  writeDb: jest.fn(() => undefined),
}));

import { getServerSession } from "next-auth/next";
import { POST } from "../../app/api/users/[username]/avatar/route";

const withSession = (id?: string) => {
  (getServerSession as jest.Mock).mockResolvedValue(id ? { user: { id } } : null);
};

const makeDb = () => ({
  users: [
    { id: "u1", username: "alice", displayName: "Alice", avatarUrl: null },
    { id: "u2", username: "bob", displayName: "Bob", avatarUrl: null },
  ],
  posts: [],
  likes: [],
  replies: [],
});

describe("/api/users/[username]/avatar POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentDb = makeDb();
  });

  it("returns 401 when no session", async () => {
    // targets: FM1
    withSession();
    const req = { formData: async () => new FormData() } as any;
    const res = await POST(req, { params: Promise.resolve({ username: "alice" }) });
    expect(res.status).toBe(401);
  });

  it("returns 400 when no file is provided", async () => {
    // targets: FM2
    withSession("u1");
    const req = { formData: async () => new FormData() } as any;
    const res = await POST(req, { params: Promise.resolve({ username: "alice" }) });
    expect(res.status).toBe(400);
  });

  it("returns 400 when file is not an image type", async () => {
    // targets: FM3
    withSession("u1");
    const fd = new FormData();
    fd.append("avatar", new File(["text"], "a.txt", { type: "text/plain" }));
    const req = { formData: async () => fd } as any;

    const res = await POST(req, { params: Promise.resolve({ username: "alice" }) });
    expect(res.status).toBe(400);
  });

  it("returns 413 when file exceeds 2MB", async () => {
    // targets: FM4
    withSession("u1");
    const tooLarge = new Uint8Array(2 * 1024 * 1024 + 1);
    const fd = new FormData();
    fd.append("avatar", new File([tooLarge], "big.png", { type: "image/png" }));
    const req = { formData: async () => fd } as any;

    const res = await POST(req, { params: Promise.resolve({ username: "alice" }) });
    expect(res.status).toBe(413);
  });

  it("returns 200 with base64 avatarUrl for valid image upload", async () => {
    // targets: FM5
    withSession("u1");
    const fd = new FormData();
    fd.append("avatar", new File([new Uint8Array([1, 2, 3, 4])], "ok.png", { type: "image/png" }));
    const req = { formData: async () => fd } as any;

    const res = await POST(req, { params: Promise.resolve({ username: "alice" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.avatarUrl).toContain("data:image/png;base64,");
    expect(currentDb.users.find((u: any) => u.id === "u1").avatarUrl).toContain("data:image/png;base64,");
  });
});
