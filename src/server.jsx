const BASE_URL = "https://backend-remen-admin.vercel.app"; 
//const BASE_URL = "http://localhost:3000"; 
export async function apiFetch(endpoint, options = {}) {
  const defaultOptions = {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };

  const mergedOptions = { ...defaultOptions, ...options };

  console.log("Fetching:", `${BASE_URL}${endpoint}`, mergedOptions); // << debug di sini

  const response = await fetch(`${BASE_URL}${endpoint}`, mergedOptions);

  if (!response.ok) {
    let errorMsg = "Request failed";
    try {
      const errData = await response.json();
      errorMsg = errData.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}


