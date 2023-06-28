"use client";

import { useAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { userHasLoggedIn } from "../_state/user-has-logged-in";

export const LoginState = ({ serverSaysYes }: { serverSaysYes: boolean }) => {
  useHydrateAtoms([[userHasLoggedIn, serverSaysYes]]);
  const [userIsLoggedIn, setUserLoggedIn] = useAtom(userHasLoggedIn);
  return <p>user logged in: {userIsLoggedIn.toString()}</p>;
};
