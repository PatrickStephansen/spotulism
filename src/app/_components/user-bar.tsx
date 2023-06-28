"use client";
import { useAtom, useAtomValue } from "jotai";
import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren, useEffect } from "react";
import { userHasLoggedIn } from "../_state/user-has-logged-in";
import { userProfile } from "../_state/user-profile";

export const UserBar = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useAtom(userProfile);
  const userIsLoggedIn = useAtomValue(userHasLoggedIn);

  useEffect(() => {
    if (userHasLoggedIn && !user) {
      // todo: validation of user object
      // todo: find out why this fetches twice. could just be double render debug nonsense
      fetch("/api/user-profile")
        .then((response) => response.json())
        .then((user) => setUser(user));
    }
  }, [userIsLoggedIn, user, setUser]);

  return (
    <div className="sticky top-0 bg-slate-900">
      {children}
      {userIsLoggedIn && user ? (
        <Link href="/profile" className="flex items-center">
          {user.displayName}
          <Image
            src={user.imageUrl}
            className="px-2 rounded-full"
            width={50}
            height={50}
            alt="user profile"
          />
        </Link>
      ) : (
        <Link href="/api/login">Login</Link>
      )}
    </div>
  );
};
