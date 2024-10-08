import { axiosInstance } from "../utils/axios";

interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export const refreshToken = async (

): Promise<RefreshTokenResponse> => {
  const refreshToken = localStorage.getItem("refreshToken");
  try {
    const response = await axiosInstance.post("/auth/refresh-token", {
      refreshToken,
    });

    const { token, refreshToken: newRefreshToken } = response.data;
    localStorage.setItem("authToken", token);
    localStorage.setItem("refreshToken", newRefreshToken);

    return { token, refreshToken: newRefreshToken };
  } catch (error) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/session-expired";
    console.error("Failed to refresh token:", error);
    throw error;
  }
};
