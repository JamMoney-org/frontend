export async function authorizedFetch(url, options = {}) {
  let accessToken = localStorage.getItem("accessToken");

  let headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };

  try {
    let response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    if (response.status === 401) {
      console.warn("accessToken 만료됨 → refresh 시도");

      const refreshRes = await fetch("https://jm-money.com/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!refreshRes.ok) throw new Error("refreshToken도 만료됨");

      const { accessToken: newAccessToken } = await refreshRes.json();
      localStorage.setItem("accessToken", newAccessToken);

      return fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
        credentials: "include",
      });
    }

    return response;
  } catch (err) {
    console.error("authorizedFetch 오류:", err);
    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
    window.location.href = "/";
    throw err;
  }
}
