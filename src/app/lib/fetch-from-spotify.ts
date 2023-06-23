import { cookies } from "next/headers";
// If we need this on the front-end, we need to stop making the cookie http_only
// Maybe this should all be wrapped up in a route
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
  const requestParams: [string, Object] = [
    `${process.env.SPOTIFY_API_URL}${endpoint}`,
    {
      headers,
      method,
      body:
        body instanceof Object && !(body instanceof FormData)
          ? JSON.stringify(body)
          : body,
    },
  ];
  let response = await fetch(...requestParams);
  // try refresh token if expired
  if (response.status === 401) {
    const tokenRefreshResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/refresh-token`
    );
    if (!tokenRefreshResponse.ok) {
      return tokenRefreshResponse;
    }
    response = await fetch(...requestParams);
  }
  return response;
};
