import React from "react";
import { act } from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import PostCard from "../../components/posts/PostCard";
import { PostResponse } from "../../types/post";

type PostOverrides = Partial<Omit<PostResponse, "author">> & {
  author?: Partial<PostResponse["author"]>;
};

const makePost = (overrides: PostOverrides = {}): PostResponse => {
  const base: PostResponse = {
    id: "post-1",
    content: "Hello microblog world",
    author: {
      id: "user-1",
      username: "alice",
      displayName: "Alice Doe",
      avatarUrl: "https://example.com/avatar.png",
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likeCount: 2,
    replyCount: 1,
    likedByCurrentUser: false,
  };

  return {
    ...base,
    ...overrides,
    author: {
      ...base.author,
      ...(overrides.author || {}),
    },
  };
};

describe("PostCard", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-31T12:00:00.000Z"));
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  // Counterexample-first pass:
  // 1) Wrong impl: Delete button shown for everyone.
  //    Minimal counterexample: currentUserId !== post.author.id should not render "Delete".
  // 2) Wrong impl: Like state updates only after server resolves.
  //    Minimal counterexample: delayed fetch promise, UI should still switch to optimistic "Unlike" immediately.
  // 3) Wrong impl: Reply toggle crashes for empty replies response.
  //    Minimal counterexample: GET /replies returns [] and UI must show "No replies yet.".

  const flushMicrotasks = async () => {
    await act(async () => {
      await Promise.resolve();
    });
  };

  it("renders post content, author fields, relative time, like count, and reply count", () => {
    const post = makePost({ likeCount: 2, replyCount: 1 });

    const view = render(<PostCard post={post} currentUserId="viewer-9" />);

    expect(view.getByText("Hello microblog world")).toBeInTheDocument();
    expect(view.getByText("Alice Doe")).toBeInTheDocument();
    expect(view.getByText("@alice")).toBeInTheDocument();
    expect(view.getByText(/2h ago/)).toBeInTheDocument();
    expect(view.getByText("2")).toBeInTheDocument();
    expect(view.getByText("1")).toBeInTheDocument();
  });

  it("shows Delete button only when current user is the author", () => {
    // targets: FM1
    const post = makePost({ author: { id: "author-1" } });

    const view = render(<PostCard post={post} currentUserId="viewer-9" />);
    expect(view.queryByText("Delete")).not.toBeInTheDocument();

    view.rerender(<PostCard post={post} currentUserId="author-1" />);
    expect(view.getByText("Delete")).toBeInTheDocument();
  });

  it("calls POST /api/posts/[postId]/like when like button is clicked", async () => {
    const post = makePost({ id: "p-123", likedByCurrentUser: false, likeCount: 2 });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ liked: true, likeCount: 3 }),
    });

    const view = render(<PostCard post={post} currentUserId="viewer-9" />);

    await act(async () => {
      view.getByTitle("Like").click();
    });

    await flushMicrotasks();
    expect(global.fetch).toHaveBeenCalledWith("/api/posts/p-123/like", { method: "POST" });
  });

  it("updates like UI optimistically before API response", async () => {
    // targets: FM2
    const post = makePost({ id: "p-optimistic", likedByCurrentUser: false, likeCount: 2 });

    let resolveFetch: (value: unknown) => void = () => {};
    const delayedFetch = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    (global.fetch as jest.Mock).mockReturnValueOnce(delayedFetch as Promise<Response>);

    const view = render(<PostCard post={post} currentUserId="viewer-9" />);

    await act(async () => {
      view.getByTitle("Like").click();
    });

    expect(view.getByTitle("Unlike")).toBeInTheDocument();
    expect(view.getByText("3")).toBeInTheDocument();

    resolveFetch({
      ok: true,
      json: async () => ({ liked: true, likeCount: 3 }),
    });

    await flushMicrotasks();
    expect(global.fetch).toHaveBeenCalledWith("/api/posts/p-optimistic/like", { method: "POST" });
  });

  it("reverts like state and count when like API fails", async () => {
    // targets: FM3
    const post = makePost({ id: "p-fail", likedByCurrentUser: false, likeCount: 2 });

    let resolveFetch: (value: unknown) => void = () => {};
    const delayedFetch = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    (global.fetch as jest.Mock).mockReturnValueOnce(delayedFetch as Promise<Response>);

    const view = render(<PostCard post={post} currentUserId="viewer-9" />);

    await act(async () => {
      view.getByTitle("Like").click();
    });
    expect(view.getByTitle("Unlike")).toBeInTheDocument();

    resolveFetch({
      ok: false,
      json: async () => ({ error: "boom" }),
    });

    await flushMicrotasks();
    expect(view.getByTitle("Like")).toBeInTheDocument();
    expect(view.getByText("2")).toBeInTheDocument();
    expect(view.getByText("Failed to update like")).toBeInTheDocument();
  });

  it("does not crash and renders initials fallback when avatarUrl is null", () => {
    // targets: FM4
    const post = makePost({ author: { displayName: "No Avatar", avatarUrl: null } });

    const view = render(<PostCard post={post} currentUserId="viewer-9" />);

    expect(view.getByText("No Avatar")).toBeInTheDocument();
    expect(view.getByText("NA")).toBeInTheDocument();
  });

  it("expands replies and shows empty state when API returns zero replies", async () => {
    // targets: FM5
    const post = makePost({ id: "p-replies", replyCount: 0 });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const view = render(<PostCard post={post} currentUserId="viewer-9" />);
    const { container } = view;

    const replyToggle = container.querySelector('button[aria-expanded]') as HTMLButtonElement;
    expect(replyToggle).toBeTruthy();

    await act(async () => {
      replyToggle.click();
    });

    await flushMicrotasks();
    expect(global.fetch).toHaveBeenCalledWith("/api/posts/p-replies/replies");
    expect(view.getByText("No replies yet.")).toBeInTheDocument();
    expect(view.getByPlaceholderText("Write a reply...")).toBeInTheDocument();
  });

  it("handles empty post content without crashing", () => {
    const post = makePost({ content: "" });

    const view = render(<PostCard post={post} currentUserId="viewer-9" />);

    expect(view.getByText("Alice Doe")).toBeInTheDocument();
    expect(view.getByText("@alice")).toBeInTheDocument();
  });
});
