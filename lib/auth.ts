import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { readDb } from './db';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', required: true },
        password: { label: 'Password', type: 'password', required: true },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const db = readDb();
        const user = db.users.find((u: any) => u.email === credentials.email);
        if (!user || !user.hashedPassword) return null;
        const valid = await compare(credentials.password, user.hashedPassword);
        if (!valid) return null;
        // Never return hashedPassword
        const { hashedPassword, ...safeUser } = user;
        return safeUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && typeof user === 'object') {
        // Attach custom fields to token if present
        if ('id' in user) token.id = (user as any).id;
        if ('username' in user) token.username = (user as any).username;
        if ('displayName' in user) token.displayName = (user as any).displayName;
        if ('email' in user) token.email = (user as any).email;
      }
      // Never keep avatarUrl in JWT cookie (can be large data URL and trigger HTTP 431).
      delete (token as any).avatarUrl;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).displayName = token.displayName;
        (session.user as any).email = token.email;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

export default authOptions;
