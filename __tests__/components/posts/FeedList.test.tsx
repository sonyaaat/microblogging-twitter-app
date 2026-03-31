import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import FeedList from "../../../components/posts/FeedList";
import { makePost, makeUser } from "../../../test-utils/factories";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/feed",
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("../../../components/posts/PostCard", () => ({
  __esModule: true,
  default: ({ post }: { post: { id: string; content: string } }) => <div data-testid="post-card">{post.content}</div>,
}));

jest.mock("../../../components/posts/PostForm", () => ({
  __esModule: true,
  default: () => <div>PostForm</div>,
}));

describe("FeedList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();

    (global as any).IntersectionObserver = class {
      observe() {}
      disconnect() {}
      unobserve() {}
    };
  });

  it("renders list of PostCards when posts provided", async () => {
    const p1 = makePost({ id: "p1", content: "post one" });
    const p2 = makePost({ id: "p2", content: "post two" });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [p1, p2], nextCursor: null }),
    });

    const user = makeUser();
    render(<FeedList currentUserId={user.id} />);

    expect(await screen.findByText("post one")).toBeInTheDocument();
    expect(screen.getByText("post two")).toBeInTheDocument();
    expect(screen.getAllByTestId("post-card")).toHaveLength(2);
  });

  it("shows empty state when posts array is empty", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [], nextCursor: null }),
    });

    render(<FeedList currentUserId="u-1" />);

    expect(await screen.findByText("No posts yet — be the first!")).toBeInTheDocument();
  });

  it('shows "Load more" button when more pages exist', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [makePost()], nextCursor: "next-cursor" }),
    });

    render(<FeedList currentUserId="u-1" />);

    expect(await screen.findByRole("button", { name: "Load more" })).toBeInTheDocument();
  });

  it('hides "Load more" when on last page', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [makePost()], nextCursor: null }),
    });

    render(<FeedList currentUserId="u-1" />);

    await screen.findByTestId("post-card");
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
  });

  it('calls fetch for next page when "Load more" is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: [makePost({ id: "p1", content: "first" })], nextCursor: "cursor-1" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: [makePost({ id: "p2", content: "second" })], nextCursor: null }),
      });

    render(<FeedList currentUserId="u-1" />);

    fireEvent.click(await screen.findByRole("button", { name: "Load more" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/posts?cursor=cursor-1");
    });
  });
});
