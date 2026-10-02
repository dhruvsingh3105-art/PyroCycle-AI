const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Resilient fetch wrapper with automatic JWT refresh on 401 Unauthorized
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  
  const headers = { ...options.headers };
  const token = localStorage.getItem("token");

  // Only attach authorization if not explicitly provided
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Do not set Content-Type if body is FormData (let browser set boundary)
  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let response = await fetch(url, { ...options, headers });

  // If 401 Unauthorized, attempt refresh
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.dispatchEvent(new Event("auth:expired"));
      return response;
    }

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${refreshToken}`,
            "Content-Type": "application/json",
          },
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          const newToken = data.access_token;
          localStorage.setItem("token", newToken);
          isRefreshing = false;
          onRefreshed(newToken);

          // Retry the original request with new token
          headers["Authorization"] = `Bearer ${newToken}`;
          return fetch(url, { ...options, headers });
        } else {
          // Refresh token expired or revoked
          isRefreshing = false;
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          window.dispatchEvent(new Event("auth:expired"));
          return response;
        }
      } catch (err) {
        isRefreshing = false;
        return response;
      }
    } else {
      // Queue requests until refresh completes
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          headers["Authorization"] = `Bearer ${newToken}`;
          resolve(fetch(url, { ...options, headers }));
        });
      });
    }
  }

  return response;
}
