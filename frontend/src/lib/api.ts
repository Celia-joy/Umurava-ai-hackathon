const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json() as Promise<T>;
};

export const apiFetch = async <T>(path: string, options: RequestInit = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const target = path.startsWith("http") ? path : `${API_URL}${path}`;

  let response: Response;

  try {
    response = await fetch(target, {
      ...options,
      headers,
      cache: "no-store"
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? `Unable to reach the API at ${target}. Check that the backend server is running and the proxy/backend URL is correct.`
        : "Network request failed";
    throw new Error(message);
  }

  return parseResponse<T>(response);
};
