import { cookies } from "next/headers";
export const fetchFromSpotify = async (
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: Object | FormData | string | undefined,
  bodyType: "form" | "json" = "form"
) => {
  const headers = {
    Authorization: `Bearer ${cookies().get("SPOTIFY_ACCESS_TOKEN")?.value}`,
    "Content-Type":
      bodyType === "json"
        ? "application/json"
        : "application/x-www-form-urlencoded",
  };
  return await fetch(`${process.env.SPOTIFY_API_URL}${endpoint}`, {
    headers,
    method,
    body:
      body instanceof Object && !(body instanceof FormData)
        ? JSON.stringify(body)
        : body,
  });
};
