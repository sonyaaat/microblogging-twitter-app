export interface Author {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface PostResponse {
  id: string;
  content: string;
  author: Author;
  createdAt: string; // ISO 8601
  likeCount: number;
  replyCount: number;
  likedByCurrentUser: boolean;
}

export interface ReplyResponse {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
}

export interface FeedResponse {
  posts: PostResponse[];
  nextCursor: string | null; // cursor for next page
}
