import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReplyList from "../../../components/posts/ReplyList";
import { makeReply } from "../../../test-utils/factories";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe("ReplyList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders list of replies with author name and content", () => {
    const r1 = makeReply({ id: "r1", content: "First reply", author: { id: "u1", username: "bob", displayName: "Bob", avatarUrl: null } });
    const r2 = makeReply({ id: "r2", content: "Second reply", author: { id: "u2", username: "eve", displayName: "Eve", avatarUrl: null } });

    render(<ReplyList replies={[r1, r2]} />);

    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("First reply")).toBeInTheDocument();
    expect(screen.getByText("Eve")).toBeInTheDocument();
    expect(screen.getByText("Second reply")).toBeInTheDocument();
  });

  it("shows empty state when replies array is empty", () => {
    render(<ReplyList replies={[]} />);
    expect(screen.getByText("No replies yet.")).toBeInTheDocument();
  });

  it("handles non-array input without crashing", () => {
    render(<ReplyList replies={null as unknown as any[]} />);
    expect(screen.getByText("No replies yet.")).toBeInTheDocument();
  });
});
