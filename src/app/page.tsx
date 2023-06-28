import Link from 'next/link'

export default function Home() {
  return (
    <Link href="/api/login" prefetch={false}>Log in with Spotify</Link>
  )
}
