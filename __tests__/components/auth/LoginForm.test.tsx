import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginForm from "../../../components/auth/LoginForm";
import { makeUser } from "../../../test-utils/factories";

const pushMock = jest.fn();
const signInMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: (...args: unknown[]) => signInMock(...args),
  signOut: jest.fn(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders email and password fields and submit button", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("disables submit button when fields are empty", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: "Sign In" })).toBeDisabled();
  });

  it("calls signIn with email and password on submit", async () => {
    const user = makeUser();
    signInMock.mockResolvedValueOnce({ ok: true });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: user.email } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith("credentials", {
        email: user.email,
        password: "password123",
        redirect: false,
      });
    });
  });

  it("shows error message when signIn returns an error", async () => {
    signInMock.mockResolvedValueOnce({ ok: false, error: "Invalid credentials" });
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@a.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "badpass" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("shows loading state while submitting", async () => {
    let resolveSignIn: (value: unknown) => void = () => {};
    signInMock.mockReturnValueOnce(new Promise((resolve) => {
      resolveSignIn = resolve;
    }));

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "alice@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    expect(screen.getByRole("button", { name: "Sign In" })).toBeDisabled();

    resolveSignIn({ ok: true });
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/feed"));
  });
});
