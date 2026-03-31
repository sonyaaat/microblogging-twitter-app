import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import TopBar from "../../components/layout/TopBar";
import type { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; username?: string; displayName?: string } | undefined;

  if (!user?.id) {
    redirect("/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a" }}>
      <TopBar username={user.username || ""} />
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}
