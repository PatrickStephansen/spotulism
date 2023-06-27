import Link from "next/link";
import { myState } from "./lib/testing-state-retention";

export default function Home() {
  myState.timesNavigated++;
  return (
    <>
      <Link href="/api/login">Log in with Spotify</Link>
      <p>Times navigated: {myState.timesNavigated}</p>
    </>
  );
}
