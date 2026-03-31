import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PostForm from "../../../components/posts/PostForm";
import { makePost } from "../../../test-utils/factories";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe("PostForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("renders textarea with placeholder", () => {
    render(<PostForm onPostCreated={jest.fn()} />);
    expect(screen.getByPlaceholderText("What's happening?")).toBeInTheDocument();
  });

  it('shows character counter "0 / 280"', () => {
    render(<PostForm onPostCreated={jest.fn()} />);
    expect(screen.getByText("0 / 280")).toBeInTheDocument();
  });

  it("counter turns red-ish when over 260 characters", () => {
    render(<PostForm onPostCreated={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("What's happening?"), {
      target: { value: "a".repeat(261) },
    });

    const counter = screen.getByText("261 / 280");
    expect(counter).toHaveStyle({ color: "#ec4899" });
  });

  it("submit button disabled when content is empty", () => {
    render(<PostForm onPostCreated={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Post" })).toBeDisabled();
  });

  it("submit button disabled when content exceeds 280 chars", () => {
    render(<PostForm onPostCreated={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("What's happening?"), {
      target: { value: "a".repeat(281) },
    });
    expect(screen.getByRole("button", { name: "Post" })).toBeDisabled();
  });

  it("calls POST /api/posts on valid submit", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => makePost(),
    });

    render(<PostForm onPostCreated={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("What's happening?"), {
      target: { value: "A new post" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Post" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/posts", expect.objectContaining({ method: "POST" }));
    });
  });

  it("clears textarea after successful post", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => makePost(),
    });

    render(<PostForm onPostCreated={jest.fn()} />);

    const textarea = screen.getByPlaceholderText("What's happening?") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Will clear" } });
    fireEvent.click(screen.getByRole("button", { name: "Post" }));

    await waitFor(() => expect(textarea.value).toBe(""));
  });
});
