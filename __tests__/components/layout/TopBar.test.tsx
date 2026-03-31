import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TopBar from "../../../components/layout/TopBar";
import { makeUser } from "../../../test-utils/factories";

jest.mock("next/navigation", () => ({
  usePathname: () => "/feed",
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe("TopBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders app name", () => {
    const user = makeUser();
    render(<TopBar username={user.username} />);

    expect(screen.getByText("Microlog")).toBeInTheDocument();
  });

  it("renders menu icon", () => {
    const user = makeUser();
    render(<TopBar username={user.username} />);

    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("clicking menu icon opens navigation drawer", async () => {
    const user = makeUser();
    render(<TopBar username={user.username} />);

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    expect(await screen.findByRole("dialog", { name: "Navigation drawer" })).toBeInTheDocument();
  });
});
