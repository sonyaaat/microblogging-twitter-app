import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Sidebar from "../../../components/layout/Sidebar";
import { makeUser } from "../../../test-utils/factories";

const signOutMock = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => "/feed",
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

describe("Sidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.innerWidth = 1024;
    window.dispatchEvent(new Event("resize"));
  });

  it("renders logo, links and sign out button", async () => {
    const user = makeUser();
    render(<Sidebar username={user.username} displayName={user.displayName} />);

    expect(await screen.findByText("Microlog")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Feed" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
  });

  it("clicking Sign Out opens confirmation modal", async () => {
    const user = makeUser();
    render(<Sidebar username={user.username} displayName={user.displayName} />);

    fireEvent.click(await screen.findByRole("button", { name: "Sign Out" }));
    expect(await screen.findByText("Sign out?")).toBeInTheDocument();
  });

  it("confirming modal calls signOut", async () => {
    const user = makeUser();
    render(<Sidebar username={user.username} displayName={user.displayName} />);

    fireEvent.click(await screen.findByRole("button", { name: "Sign Out" }));

    const modalButtons = await screen.findAllByRole("button", { name: "Sign Out" });
    fireEvent.click(modalButtons[1]);

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: "/login" });
    });
  });

  it("cancelling modal keeps user logged in", async () => {
    const user = makeUser();
    render(<Sidebar username={user.username} displayName={user.displayName} />);

    fireEvent.click(await screen.findByRole("button", { name: "Sign Out" }));
    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByText("Sign out?")).not.toBeInTheDocument();
    });
    expect(signOutMock).not.toHaveBeenCalled();
  });
});
