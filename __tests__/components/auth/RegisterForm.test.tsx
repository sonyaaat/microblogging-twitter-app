import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import RegisterForm from "../../../components/auth/RegisterForm";
import { makeUser } from "../../../test-utils/factories";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/register",
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("renders all required fields", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("shows inline error when username format is invalid", async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "alice@example.com" } });
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "!" } });
    fireEvent.change(screen.getByLabelText("Display Name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password1!" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "Password1!" } });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByText("Username must be 3-20 characters, alphanumeric or underscores.")).toBeInTheDocument();
  });

  it("shows inline error when passwords do not match", async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "alice@example.com" } });
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "alice_1" } });
    fireEvent.change(screen.getByLabelText("Display Name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password1!" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "Password1" } });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument();
  });

  it("shows inline error when password is under 8 characters", async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "alice@example.com" } });
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "alice_1" } });
    fireEvent.change(screen.getByLabelText("Display Name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "short" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByText("Password must be at least 8 characters.")).toBeInTheDocument();
  });

  it("calls POST /api/auth/register on valid submit", async () => {
    const user = makeUser({ username: "alice_1", displayName: "Alice" });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "u-1" }),
    });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: user.email } });
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: user.username } });
    fireEvent.change(screen.getByLabelText("Display Name"), { target: { value: user.displayName } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password1!" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "Password1!" } });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/register", expect.objectContaining({ method: "POST" }));
    });
  });

  it("shows server error message on 409 response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: "Username already exists" }),
    });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "alice@example.com" } });
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "alice_1" } });
    fireEvent.change(screen.getByLabelText("Display Name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password1!" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "Password1!" } });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByText("Username already exists")).toBeInTheDocument();
  });
});
