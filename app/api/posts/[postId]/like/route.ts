import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { readDb, writeDb, generateId } from '../../../../../lib/db';
import { logInfo, logError } from '../../../../../lib/logger';

// POST /api/posts/[postId]/like — Toggle Like
export async function POST(
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
  const likeIdx = db.likes.findIndex((l: any) => l.postId === post.id && l.userId === user.id);
  let liked: boolean;
  if (likeIdx !== -1) {
    db.likes.splice(likeIdx, 1);
    liked = false;
  } else {
    db.likes.push({ id: generateId(), postId: post.id, userId: user.id, createdAt: new Date().toISOString() });
    liked = true;
  }
  await writeDb(db);
  const likeCount = db.likes.filter((l: any) => l.postId === post.id).length;
  logInfo('Like toggled', { postId: post.id, userId: user.id, liked });
  return NextResponse.json({ liked, likeCount });
}
