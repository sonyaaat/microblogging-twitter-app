import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "../../../../lib/auth";
import { readDb } from "../../../../lib/db";
import ProfileHeader from "../../../../components/profile/ProfileHeader";
import UserPostList from "../../../../components/profile/UserPostList";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions);
  const currentUser = session?.user as { id: string } | undefined;

  if (!currentUser?.id) {
    redirect("/login");
  }

  const { username } = await params;
  const normalizedUsername = decodeURIComponent(username).trim().toLowerCase();
  const db = readDb();
  const user = db.users.find(
    (u: any) => typeof u.username === "string" && u.username.trim().toLowerCase() === normalizedUsername
  );

  if (!user) {
    notFound();
  }

  const userPosts = db.posts.filter((p: any) => p.authorId === user.id);
  const postIds = new Set(userPosts.map((p: any) => p.id));
  const likeCount = db.likes.filter((l: any) => postIds.has(l.postId)).length;

  const profile = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio ?? null,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt,
    postCount: userPosts.length,
    likeCount,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 680 }}>
        <ProfileHeader initialProfile={profile} isOwnProfile={currentUser.id === user.id} />
        <UserPostList username={user.username} currentUserId={currentUser.id} />
      </div>
    </main>
  );
}
