import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SessionProvider from "../../../components/layout/SessionProvider";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("SessionProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children without crashing", () => {
    render(
      <SessionProvider session={null}>
        <div>Child content</div>
      </SessionProvider>
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();
  });
});
