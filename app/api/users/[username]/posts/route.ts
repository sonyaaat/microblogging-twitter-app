import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { readDb } from '../../../../../lib/db';
import type { FeedResponse, PostResponse } from '../../../../../types/post';

// GET /api/users/[username]/posts
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const session = await getServerSession(authOptions);
  const currentUser = session?.user as { id: string } | undefined;
  if (!currentUser?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { username } = await params;
  const normalizedUsername = decodeURIComponent(username).trim().toLowerCase();
  const { searchParams } = new URL(req.url);
  const cursorParam = searchParams.get('cursor');
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

  const db = readDb();
  const profileUser = db.users.find(
    (u: any) => typeof u.username === 'string' && u.username.trim().toLowerCase() === normalizedUsername
  );
  if (!profileUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const allUserPosts = db.posts
    .filter((p: any) => p.authorId === profileUser.id)
    .sort((a: any, b: any) => {
      if (b.createdAt !== a.createdAt) return b.createdAt.localeCompare(a.createdAt);
      return b.id.localeCompare(a.id);
    });

  let startIdx = 0;
  if (cursorParam) {
    try {
      const cursor = JSON.parse(Buffer.from(cursorParam, 'base64').toString());
      startIdx = allUserPosts.findIndex(
        (p: any) => p.createdAt === cursor.createdAt && p.id === cursor.id
      ) + 1;
    } catch {
      return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 });
    }
  }

  const page = allUserPosts.slice(startIdx, startIdx + limit);
  const nextCursor =
    page.length === limit
      ? Buffer.from(
          JSON.stringify({
            createdAt: page[page.length - 1].createdAt,
            id: page[page.length - 1].id,
          })
        ).toString('base64')
      : null;

  const posts: PostResponse[] = page.map((post: any) => {
    const likeCount = db.likes.filter((l: any) => l.postId === post.id).length;
    const replyCount = db.replies.filter((r: any) => r.postId === post.id).length;
    const likedByCurrentUser = db.likes.some(
      (l: any) => l.postId === post.id && l.userId === currentUser.id
    );

    return {
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      author: {
        id: profileUser.id,
        username: profileUser.username,
        displayName: profileUser.displayName,
        avatarUrl: profileUser.avatarUrl ?? null,
      },
      likeCount,
      replyCount,
      likedByCurrentUser,
    };
  });

  const response: FeedResponse = { posts, nextCursor };
  return NextResponse.json(response);
}
