import { Inter } from "next/font/google";
import { cookies } from "next/headers";
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
            refreshEndpoint="/api/user-profile"
          />
          <UserBar isLoggedIn={isUserLoggedIn}></UserBar>
          <div className="main content px-5 py-1">{children}</div>
          <Player />
        </AppStateProvider>
      </body>
    </html>
  );
}
