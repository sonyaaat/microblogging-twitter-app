import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { readDb, writeDb } from '../../../../../lib/db';

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

export async function POST(
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

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const fileValue = formData.get('avatar');
  if (!(fileValue instanceof File)) {
    return NextResponse.json({ error: 'Avatar file is required' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(fileValue.type)) {
    return NextResponse.json({ error: 'Unsupported file type. Use jpeg, png, gif, or webp.' }, { status: 400 });
  }

  if (fileValue.size > MAX_AVATAR_SIZE_BYTES) {
    return NextResponse.json({ error: 'File is too large. Max size is 2MB.' }, { status: 413 });
  }

  const fileBuffer = Buffer.from(await fileValue.arrayBuffer());
  const base64 = fileBuffer.toString('base64');
  const avatarUrl = `data:${fileValue.type};base64,${base64}`;

  targetUser.avatarUrl = avatarUrl;
  db.users[userIndex] = targetUser;
  writeDb(db);

  return NextResponse.json({ avatarUrl });
}
