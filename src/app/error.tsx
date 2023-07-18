"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div>
      <p>Something went wrong.</p>
      <button className="p-2 round border" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
