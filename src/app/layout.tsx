import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { LoginState } from "./_components/login-state";
import { AppStateProvider } from "./_components/state-provider";
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
          <UserBar isLoggedIn={isUserLoggedIn}>
          </UserBar>
          <div className="main content px-5 py-1">{children}</div>
        </AppStateProvider>
      </body>
    </html>
  );
}
