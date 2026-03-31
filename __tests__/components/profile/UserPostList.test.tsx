import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserPostList from "../../../components/profile/UserPostList";
import { makePost, makeUser } from "../../../test-utils/factories";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("../../../components/posts/PostCard", () => ({
  __esModule: true,
  default: ({ post }: { post: { content: string } }) => <div data-testid="post-card">{post.content}</div>,
}));

describe("UserPostList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    (global as any).IntersectionObserver = class {
      observe() {}
      disconnect() {}
      unobserve() {}
    };
  });

  it("renders posts using PostCard components", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        posts: [makePost({ id: "p1", content: "one" }), makePost({ id: "p2", content: "two" })],
        nextCursor: null,
      }),
    });

    const user = makeUser();
    render(<UserPostList username={user.username} currentUserId={user.id} />);

    expect(await screen.findByText("one")).toBeInTheDocument();
    expect(screen.getByText("two")).toBeInTheDocument();
    expect(screen.getAllByTestId("post-card")).toHaveLength(2);
  });

  it('shows "No posts yet" when posts array is empty', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [], nextCursor: null }),
    });

    const user = makeUser();
    render(<UserPostList username={user.username} currentUserId={user.id} />);

    expect(await screen.findByText("No posts yet")).toBeInTheDocument();
  });

  it("shows Load more button when more pages exist", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [makePost()], nextCursor: "cursor-1" }),
    });

    const user = makeUser();
    render(<UserPostList username={user.username} currentUserId={user.id} />);

    expect(await screen.findByRole("button", { name: "Load more" })).toBeInTheDocument();
  });
});
