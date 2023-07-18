import { cookies } from "next/headers";
import { Search } from "./_components/search";
import { redirect } from "next/navigation";

export default function Home() {
  const isUserLoggedIn = cookies().has("SPOTIFY_USER_TOKEN");
  if (!isUserLoggedIn) return redirect("/logged-out")
  return (
    <>
      <Search />
    </>
  );
}
