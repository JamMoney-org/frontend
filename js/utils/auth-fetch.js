export async function authorizedFetch(url, options = {}) {
  let accessToken = localStorage.getItem("accessToken");
  let refreshToken = localStorage.getItem("refreshToken");

  let headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };

  try {
    let response = await fetch(url, {
      ...options,
      headers,
    });

    // accessToken 만료 처리
    if (response.status === 401 && refreshToken) {
      console.warn("accessToken 만료됨 → refresh 시도");

      const refreshRes = await fetch("https://jm-money.com/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshRes.ok) throw new Error("refreshToken도 만료됨");

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await refreshRes.json();

      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      // 원래 요청 재시도
      return fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
    }

    return response;
  } catch (err) {
    console.error("authorizedFetch 오류:", err);
    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
    window.location.href = "/pages/index.html";
    throw err;
  }
}
