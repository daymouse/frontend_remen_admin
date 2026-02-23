// const BASE_URL = "https://backend-remen-admin.vercel.app";
const BASE_URL = "http://localhost:8080";

let isRefreshing = false;
let refreshPromise = null;

export async function apiFetch(endpoint, options = {}) {
  const {
    throwWithData = false, 
    ...fetchOptions
  } = options;

  const defaultOptions = {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };

  const mergedOptions = { ...defaultOptions, ...fetchOptions };

  console.log("Fetching:", `${BASE_URL}${endpoint}`, mergedOptions);

  let response = await fetch(`${BASE_URL}${endpoint}`, mergedOptions);
  if (
    response.status === 401 &&
    !endpoint.startsWith("/auth/")
  ) {
    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
      }

      const refreshResponse = await refreshPromise;

      isRefreshing = false;
      refreshPromise = null;

      if (!refreshResponse.ok) {
        throw new Error("Refresh token expired");
      }

      response = await fetch(`${BASE_URL}${endpoint}`, mergedOptions);

    } catch (err) {
      isRefreshing = false;
      refreshPromise = null;
      window.location.href = "/login";
      throw err;
    }
  }
  if (!response.ok) {
    let errorMsg = "Request failed";
    let errorData = null;

    try {
      const errData = await response.json();
      errorData = errData;

      if (errData?.messages && typeof errData.messages === "object") {
        errorMsg = Object.values(errData.messages).join(", ");
      } else if (typeof errData?.message === "string") {
        errorMsg = errData.message;
      } else if (typeof errData?.error === "string") {
        errorMsg = errData.error;
      }
    } catch {}

    if (throwWithData) {
      const error = new Error(errorMsg);
      error.data = errorData?.data || errorData;
      error.status = response.status;
      throw error;
    }

    throw new Error(errorMsg);
  }
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}
