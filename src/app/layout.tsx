import "./globals.css";
import { Inter } from "next/font/google";
import { TokenRefresher } from "./_components/token-refresher";
import { UserBar } from "./_components/user-bar";
import { AppStateProvider } from "./_components/state-provider";
import { LoginState } from "./_components/login-state";
import { cookies } from "next/headers";

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
  const isUserLoggedIn = cookies().has('SPOTIFY_ACCESS_TOKEN')
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppStateProvider>
          <UserBar></UserBar>
          <LoginState serverSaysYes={isUserLoggedIn} />
          <TokenRefresher
            interval={1800000}
            refreshEndpoint="/api/refresh-token"
          />
          {children}
        </AppStateProvider>
      </body>
    </html>
  );
}
