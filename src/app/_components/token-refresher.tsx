"use client";
import { useEffect } from "react";

interface Props {
  refreshEndpoint: string;
  intervalMs: number;
}

export const TokenRefresher = ({ refreshEndpoint, intervalMs }: Props) => {
  useEffect(() => {
    const timerId = setInterval(() => fetch(refreshEndpoint), intervalMs);
    return () => clearInterval(timerId);
  }, [refreshEndpoint, intervalMs]);
  return null;
};
