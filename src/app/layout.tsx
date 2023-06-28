import "./globals.css";
import { Inter } from "next/font/google";
import { TokenRefresher } from "./_components/token-refresher";
import { UserBar } from "./_components/user-bar";
import { AppStateProvider } from "./_components/state-provider";

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
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppStateProvider>
          <UserBar></UserBar>
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
