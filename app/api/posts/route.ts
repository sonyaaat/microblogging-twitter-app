import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { readDb, writeDb, generateId } from '../../../lib/db';
import { logInfo, logError } from '../../../lib/logger';
import { validatePostContent } from '../../../lib/validatePostContent';
import type { FeedResponse, PostResponse, Author } from '../../../types/post';

// GET /api/posts — Feed
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const cursorParam = searchParams.get('cursor');
  const limitParam = searchParams.get('limit');
  const limit = Math.min(Number(limitParam) || 20, 50);

  const db = await readDb();
  let posts = db.posts.slice();
  posts.sort((a, b) => {
    if (b.createdAt !== a.createdAt) return b.createdAt.localeCompare(a.createdAt);
    return b.id.localeCompare(a.id);
  });

  let startIdx = 0;
  if (cursorParam) {
    try {
      const cursor = JSON.parse(Buffer.from(cursorParam, 'base64').toString());
      startIdx = posts.findIndex(
        p => p.createdAt === cursor.createdAt && p.id === cursor.id
      ) + 1;
    } catch {
      return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 });
    }
  }
  const page = posts.slice(startIdx, startIdx + limit);
  const nextCursor = page.length === limit ? Buffer.from(JSON.stringify({
    createdAt: page[page.length - 1].createdAt,
    id: page[page.length - 1].id,
  })).toString('base64') : null;

  const userId = user.id;
  const postResponses: PostResponse[] = page.map(post => {
    const author = db.users.find(u => u.id === post.authorId);
    const likeCount = db.likes.filter(l => l.postId === post.id).length;
    const replyCount = db.replies.filter(r => r.postId === post.id).length;
    const likedByCurrentUser = db.likes.some(l => l.postId === post.id && l.userId === userId);
    return {
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
  });

  const response: FeedResponse = {
    posts: postResponses,
    nextCursor,
  };
  return NextResponse.json(response);
}

// POST /api/posts — Create Post
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { content } = await req.json();
  const validation = validatePostContent(content);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const db = await readDb();
  const newPost = {
    id: generateId(),
    content,
    authorId: user.id,
    createdAt: new Date().toISOString(),
  };
  db.posts.push(newPost);
  await writeDb(db);
  logInfo('Post created', { postId: newPost.id, userId: user.id });
  const author = db.users.find(u => u.id === newPost.authorId);
  const postResponse: PostResponse = {
    id: newPost.id,
    content: newPost.content,
    author: author ? {
      id: author.id,
      username: author.username,
      displayName: author.displayName,
      avatarUrl: author.avatarUrl || null,
    } : { id: '', username: '', displayName: '', avatarUrl: null },
    createdAt: newPost.createdAt,
    likeCount: 0,
    replyCount: 0,
    likedByCurrentUser: false,
  };
  return NextResponse.json(postResponse, { status: 201 });
}
