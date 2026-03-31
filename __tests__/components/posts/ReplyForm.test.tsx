import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReplyForm from "../../../components/posts/ReplyForm";
import { makeReply } from "../../../test-utils/factories";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe("ReplyForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("renders textarea and submit button", () => {
    render(<ReplyForm postId="p1" />);
    expect(screen.getByPlaceholderText("Write a reply...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reply" })).toBeInTheDocument();
  });

  it("calls POST /api/posts/[postId]/replies on submit", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => makeReply(),
    });

    render(<ReplyForm postId="p1" />);

    fireEvent.change(screen.getByPlaceholderText("Write a reply..."), {
      target: { value: "Hello reply" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reply" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/posts/p1/replies",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("clears textarea after successful reply", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => makeReply(),
    });

    render(<ReplyForm postId="p1" />);

    const textarea = screen.getByPlaceholderText("Write a reply...") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Will clear" } });
    fireEvent.click(screen.getByRole("button", { name: "Reply" }));

    await waitFor(() => expect(textarea.value).toBe(""));
  });

  it("shows error when content is empty", async () => {
    const { container } = render(<ReplyForm postId="p1" />);

    const form = container.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);

    expect(await screen.findByText("Reply cannot be empty")).toBeInTheDocument();
  });
});
