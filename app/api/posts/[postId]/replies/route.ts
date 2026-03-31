import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { readDb, writeDb } from '../../../../../lib/db';
import { logInfo } from '../../../../../lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postId } = await params;
  const db = readDb();

  const post = db.posts.find((p: any) => p.id === postId);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const replies = db.replies
    .filter((r: any) => r.postId === postId)
    .sort((a: any, b: any) => a.createdAt.localeCompare(b.createdAt))
    .map((reply: any) => {
      const author = db.users.find((u: any) => u.id === reply.authorId);
      return {
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt,
        author: author
          ? {
              id: author.id,
              username: author.username,
              displayName: author.displayName,
              avatarUrl: author.avatarUrl ?? null,
            }
          : {
              id: '',
              username: '',
              displayName: '',
              avatarUrl: null,
            },
      };
    });

  return NextResponse.json(replies);
}

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

  let body: { content?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (content.length < 1 || content.length > 280) {
    return NextResponse.json({ error: 'Content must be 1–280 characters.' }, { status: 400 });
  }

  const db = readDb();
  const post = db.posts.find((p: any) => p.id === postId);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const newReply = {
    id: randomUUID(),
    content,
    authorId: user.id,
    postId,
    createdAt: new Date().toISOString(),
  };

  db.replies.push(newReply);
  writeDb(db);

  const author = db.users.find((u: any) => u.id === user.id);
  const replyResponse = {
    id: newReply.id,
    content: newReply.content,
    createdAt: newReply.createdAt,
    author: author
      ? {
          id: author.id,
          username: author.username,
          displayName: author.displayName,
          avatarUrl: author.avatarUrl ?? null,
        }
      : {
          id: '',
          username: '',
          displayName: '',
          avatarUrl: null,
        },
  };

  logInfo('Reply created', { replyId: newReply.id, postId, userId: user.id });

  return NextResponse.json(replyResponse, { status: 201 });
}
