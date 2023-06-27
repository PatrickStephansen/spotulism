import './globals.css'
import { Inter } from 'next/font/google'
import { TokenRefresher } from "./components/token-refresher";
import { myState } from './lib/testing-state-retention';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Spotulism',
  description: 'A new face for Spotify',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  myState.timesNavigatedLayout++;
  return (
    <html lang="en">
      <body className={inter.className}><TokenRefresher interval={1800000} refreshEndpoint="/api/refresh-token"/><p>times rendering layout: {myState.timesNavigatedLayout}</p>{children}</body>
    </html>
  )
}
