import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import FeedList from "../../../components/posts/FeedList";
import PostForm from "../../../components/posts/PostForm";
import { PostResponse, FeedResponse } from "../../../types/post";
import { authOptions } from "../../../lib/auth";


export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  return (
    <main style={{
      background: '#f3f4f6', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0'
    }}>
      <div style={{ width: '100%', maxWidth: 680 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 8,
            background: 'linear-gradient(90deg, #3b82f6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Global Feed
        </h1>
        <div
          style={{
            width: 76,
            height: 4,
            borderRadius: 999,
            background: 'linear-gradient(90deg, #3b82f6, #ec4899)',
            marginBottom: 20,
          }}
        />
        <FeedList currentUserId={session.user.id} />
      </div>
    </main>
  );
}
