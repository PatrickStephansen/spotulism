"use client";
import { useAtom, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren, useCallback, useEffect } from "react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { userHasLoggedIn } from "../_state/user-has-logged-in";
import { userProfile } from "../_state/user-profile";
import { LoginButton } from "./login-button";

interface Props {
  isLoggedIn: boolean;
}

export const UserBar = ({ isLoggedIn, children }: PropsWithChildren<Props>) => {
  useHydrateAtoms([[userHasLoggedIn, isLoggedIn]]);
  const [user, setUser] = useAtom(userProfile);
  const [userIsLoggedIn, setUserIsLoggedIn] = useAtom(userHasLoggedIn);

  useEffect(() => {
    if (userIsLoggedIn && !user) {
      // todo: validation of user object
      // todo: find out why this fetches twice. could just be double render debug nonsense
      fetch("/api/user-profile")
        .then((response) => response.json())
        .then((user) => setUser(user));
    }
  }, [userIsLoggedIn, user, setUser]);

  const logout = useCallback(() => {
    fetch("api/logout", { method: "POST" }).then(() => (window.location.href = '/'));
  }, []);

  return (
    <div className="sticky top-0 bg-slate-900">
      <div className="flex items-center justify-between px-5 h-50 min-h-50">
        <Link href="/" className="hover:text-blue-200">
          Spotulism
        </Link>
        {userIsLoggedIn ? children : null}
        <div className="flex items-center gap-3 justify-end">
          {userIsLoggedIn ? (
            <>
              <Link
                href="/profile"
                className="flex items-center hover:text-blue-200"
              >
                {user?.displayName ?? "User Loading..."}
                <Image
                  src={user?.imageUrl ?? "/default-profile.png"}
                  className="px-2 rounded-full"
                  width={50}
                  height={50}
                  alt="user profile"
                />
              </Link>
              <button
                className="p-2 flex gap-2 items-center hover:text-blue-200"
                onClick={logout}
              >
                <ArrowRightOnRectangleIcon height={24} />
                Log out
              </button>
            </>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </div>
  );
};
