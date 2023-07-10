"use client";

import Link from "next/link";

export const LoginButton = () => {

  return (
    <Link href="/api/login">
      <button type="button" className="border rounded p-2">
        Login
      </button>
    </Link>
  );
};
