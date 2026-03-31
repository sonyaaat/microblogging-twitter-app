import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { readDb, writeDb } from '../../../../lib/db';

interface ProfileResponse {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  postCount: number;
  likeCount: number;
}

function toProfileResponse(db: any, user: any): ProfileResponse {
  const userPosts = db.posts.filter((p: any) => p.authorId === user.id);
  const postIds = new Set(userPosts.map((p: any) => p.id));
  const likeCount = db.likes.filter((l: any) => postIds.has(l.postId)).length;

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio ?? null,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt,
    postCount: userPosts.length,
    likeCount,
  };
}

// GET /api/users/[username]
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
  const db = readDb();
  const user = db.users.find(
    (u: any) => typeof u.username === 'string' && u.username.trim().toLowerCase() === normalizedUsername
  );

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(toProfileResponse(db, user));
}

// PATCH /api/users/[username]
export async function PATCH(
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
  const db = readDb();
  const userIndex = db.users.findIndex(
    (u: any) => typeof u.username === 'string' && u.username.trim().toLowerCase() === normalizedUsername
  );

  if (userIndex === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const targetUser = db.users[userIndex];
  if (targetUser.id !== currentUser.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { displayName?: unknown; bio?: unknown; avatarUrl?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.displayName !== undefined) {
    if (typeof body.displayName !== 'string') {
      return NextResponse.json({ error: 'displayName must be a string' }, { status: 400 });
    }
    const name = body.displayName.trim();
    if (name.length < 1 || name.length > 50) {
      return NextResponse.json({ error: 'displayName must be 1–50 characters' }, { status: 400 });
    }
    targetUser.displayName = name;
  }

  if (body.bio !== undefined) {
    if (typeof body.bio !== 'string') {
      return NextResponse.json({ error: 'bio must be a string' }, { status: 400 });
    }
    const bio = body.bio.trim();
    if (bio.length > 160) {
      return NextResponse.json({ error: 'bio must be at most 160 characters' }, { status: 400 });
    }
    targetUser.bio = bio.length ? bio : null;
  }

  if (body.avatarUrl !== undefined) {
    if (typeof body.avatarUrl !== 'string') {
      return NextResponse.json({ error: 'avatarUrl must be a string' }, { status: 400 });
    }
    const avatar = body.avatarUrl.trim();
    if (!avatar) {
      targetUser.avatarUrl = null;
    } else {
      try {
        new URL(avatar);
      } catch {
        return NextResponse.json({ error: 'avatarUrl must be a valid URL' }, { status: 400 });
      }
      targetUser.avatarUrl = avatar;
    }
  }

  db.users[userIndex] = targetUser;
  writeDb(db);

  return NextResponse.json(toProfileResponse(db, targetUser));
}
