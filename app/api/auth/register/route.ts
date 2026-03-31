import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '../../../../lib/db';
import { hash } from 'bcryptjs';
import { logInfo, logError } from '../../../../lib/logger';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email, username, password, displayName } = await req.json();
    // Input validation
    if (
      !email ||
      !EMAIL_REGEX.test(email) ||
      !username ||
      !USERNAME_REGEX.test(username) ||
      !password ||
      password.length < 8 ||
      !displayName ||
      displayName.trim().length < 1
    ) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }
    // Read DB
    const db = readDb();
    // Check for duplicate email
    if (db.users.some((u: any) => u.email === email)) {
      return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });
    }
    // Check for duplicate username
    if (db.users.some((u: any) => u.username === username)) {
      return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
    }
    // Hash password
    const hashedPassword = await hash(password, 12);
    // Create user
    const userId = generateId();
    const user = {
      id: userId,
      email,
      username,
      displayName,
      hashedPassword,
      bio: null,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    writeDb(db);
    logInfo('User registered', { userId });
    return NextResponse.json({ message: 'User created successfully', userId }, { status: 201 });
  } catch (err: any) {
    logError('User registration failed', { error: err.message, stack: err.stack });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
