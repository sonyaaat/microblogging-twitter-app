import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProfileHeader from "../../../components/profile/ProfileHeader";
import { makeUser } from "../../../test-utils/factories";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe("ProfileHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("renders displayName, username, bio, and stats", () => {
    const user = makeUser();
    render(
      <ProfileHeader
        initialProfile={{
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          postCount: user.postCount,
          likeCount: user.likeCount,
        }}
        isOwnProfile
      />
    );

    expect(screen.getByText(user.displayName)).toBeInTheDocument();
    expect(screen.getByText(`@${user.username}`)).toBeInTheDocument();
    expect(screen.getByText(user.bio)).toBeInTheDocument();
    expect(screen.getByText(`${user.postCount}`)).toBeInTheDocument();
    expect(screen.getByText(`${user.likeCount}`)).toBeInTheDocument();
  });

  it("shows Edit Profile button only when isOwnProfile is true", () => {
    const user = makeUser();
    const { rerender } = render(
      <ProfileHeader
        initialProfile={{
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          postCount: user.postCount,
          likeCount: user.likeCount,
        }}
        isOwnProfile
      />
    );

    expect(screen.getByRole("button", { name: "Edit Profile" })).toBeInTheDocument();

    rerender(
      <ProfileHeader
        initialProfile={{
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          postCount: user.postCount,
          likeCount: user.likeCount,
        }}
        isOwnProfile={false}
      />
    );

    expect(screen.queryByRole("button", { name: "Edit Profile" })).not.toBeInTheDocument();
  });

  it("clicking Edit Profile opens modal with fields", async () => {
    const user = makeUser();
    render(
      <ProfileHeader
        initialProfile={{
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          postCount: user.postCount,
          likeCount: user.likeCount,
        }}
        isOwnProfile
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit Profile" }));

    expect(await screen.findByLabelText("Display Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Bio")).toBeInTheDocument();
    expect(screen.getByLabelText("Avatar URL")).toBeInTheDocument();
  });

  it("submitting modal calls PATCH /api/users/[username]", async () => {
    const user = makeUser();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: user.id,
        username: user.username,
        displayName: "Updated Name",
        bio: "Updated bio",
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        postCount: user.postCount,
        likeCount: user.likeCount,
      }),
    });

    render(
      <ProfileHeader
        initialProfile={{
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          postCount: user.postCount,
          likeCount: user.likeCount,
        }}
        isOwnProfile
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit Profile" }));

    fireEvent.change(await screen.findByLabelText("Display Name"), { target: { value: "Updated Name" } });
    fireEvent.change(screen.getByLabelText("Bio"), { target: { value: "Updated bio" } });
    fireEvent.change(screen.getByLabelText("Avatar URL"), { target: { value: "https://example.com/updated.png" } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/users/${user.username}`,
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });
});
