import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LikeButton from "../../../components/posts/LikeButton";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe("LikeButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("renders heart icon and like count", () => {
    render(<LikeButton postId="p1" initialLiked={false} initialLikeCount={2} />);
    expect(screen.getByTitle("Like")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("clicking calls POST /api/posts/[postId]/like", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ liked: true, likeCount: 3 }) });

    render(<LikeButton postId="p1" initialLiked={false} initialLikeCount={2} />);

    fireEvent.click(screen.getByTitle("Like"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/posts/p1/like", { method: "POST" });
    });
  });

  it("updates count optimistically before API response", () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(new Promise(() => {}));

    render(<LikeButton postId="p1" initialLiked={false} initialLikeCount={2} />);

    fireEvent.click(screen.getByTitle("Like"));

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByTitle("Unlike")).toBeInTheDocument();
  });

  it("reverts count if API call fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({ error: "boom" }) });

    render(<LikeButton postId="p1" initialLiked={false} initialLikeCount={2} />);

    fireEvent.click(screen.getByTitle("Like"));

    expect(await screen.findByText("Failed to update like")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("disables button during in-flight request", () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(new Promise(() => {}));

    render(<LikeButton postId="p1" initialLiked={false} initialLikeCount={2} />);

    fireEvent.click(screen.getByTitle("Like"));

    expect(screen.getByTitle("Unlike")).toBeDisabled();
  });
});
