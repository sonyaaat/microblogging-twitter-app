export interface User {
  id: string;
  email: string;
  hashedPassword: string;
  username: string;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt: string; // ISO 8601
}

export interface Post {
  id: string;
  content: string;
  authorId: string;
  createdAt: string; // ISO 8601
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string; // ISO 8601
}

export interface Reply {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string; // ISO 8601
}
