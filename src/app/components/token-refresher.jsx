"use client";
import { useEffect } from "react";

export const TokenRefresher = ({ refreshEndpoint, interval: intervalMs }) => {
  useEffect(() => {
    const timerId = setInterval(() => fetch(refreshEndpoint), intervalMs);
    return () => clearInterval(timerId);
  }, [refreshEndpoint, intervalMs]);
  return null;
};
