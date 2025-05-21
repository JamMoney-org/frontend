// js/utils/authFetch.js

export async function authorizedFetch(url, options = {}) {
  let accessToken = localStorage.getItem("authToken");
  let refreshToken = localStorage.getItem("refreshToken");

  // 기본 헤더 구성
  let headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  try {
    let response = await fetch(url, {
      ...options,
      headers: headers,
    });

    // accessToken 만료 시 → refreshToken으로 재발급
    if (response.status === 401 && refreshToken) {
      console.warn("accessToken 만료됨 → refresh 시도");

      const refreshRes = await fetch(
        `http://43.202.211.168:8080/auth/refresh?refreshToken=${refreshToken}`,
        { method: "POST" }
      );

      if (!refreshRes.ok) throw new Error("refreshToken도 만료됨");

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await refreshRes.json();

      // 새 토큰 저장
      localStorage.setItem("authToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      // 원래 요청 재시도
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newAccessToken}`,
          "Content-Type": "application/json",
        },
      });
    }

    return response;
  } catch (err) {
    console.error("authorizedFetch 오류:", err);
    alert("인증이 만료되었습니다. 다시 로그인해주세요.");
    window.location.href = "/login.html";
    throw err;
  }
}
