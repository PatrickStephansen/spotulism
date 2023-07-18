import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import Link from "next/link";
import { Player } from "./_components/player";
import { AppStateProvider } from "./_components/state-provider";
import { TokenRefresher } from "./_components/token-refresher";
import { UserBar } from "./_components/user-bar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Spotulism",
  description: "A new face for Spotify",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isUserLoggedIn = cookies().has("SPOTIFY_USER_TOKEN");
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppStateProvider>
          <TokenRefresher
            intervalMs={900000}
            refreshEndpoint="/api/refresh-token"
          />
          <UserBar isLoggedIn={isUserLoggedIn}>
            <Link href="/queue" className="hover:text-blue-200">
              Queue
            </Link>
          </UserBar>
          <div className="main content px-5 py-1">{children}</div>
          {isUserLoggedIn ? <Player /> : null}
        </AppStateProvider>
      </body>
    </html>
  );
}
