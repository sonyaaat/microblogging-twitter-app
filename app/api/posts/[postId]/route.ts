import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { readDb, writeDb } from '../../../../lib/db';
import { logInfo, logWarn, logError } from '../../../../lib/logger';
import type { PostResponse } from '../../../../types/post';

// GET /api/posts/[postId] — Get single post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const db = await readDb();
  const post = db.posts.find((p: any) => p.id === postId);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  const author = db.users.find((u: any) => u.id === post.authorId);
  const likeCount = db.likes.filter((l: any) => l.postId === post.id).length;
  const replyCount = db.replies.filter((r: any) => r.postId === post.id).length;
  const likedByCurrentUser = db.likes.some((l: any) => l.postId === post.id && l.userId === user.id);
  const postResponse: PostResponse = {
    id: post.id,
    content: post.content,
    author: author ? {
      id: author.id,
      username: author.username,
      displayName: author.displayName,
      avatarUrl: author.avatarUrl || null,
    } : { id: '', username: '', displayName: '', avatarUrl: null },
    createdAt: post.createdAt,
    likeCount,
    replyCount,
    likedByCurrentUser,
  };
  return NextResponse.json(postResponse);
}

// DELETE /api/posts/[postId] — Delete own post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const db = await readDb();
  const postIdx = db.posts.findIndex((p: any) => p.id === postId);
  if (postIdx === -1) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  const post = db.posts[postIdx];
  if (post.authorId !== user.id) {
    logWarn('Unauthorized post delete attempt', { postId: post.id, userId: user.id });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  db.posts.splice(postIdx, 1);
  db.likes = db.likes.filter((l: any) => l.postId !== post.id);
  db.replies = db.replies.filter((r: any) => r.postId !== post.id);
  await writeDb(db);
  logInfo('Post deleted', { postId: post.id, userId: user.id });
  return NextResponse.json({ message: 'Post deleted' });
}
