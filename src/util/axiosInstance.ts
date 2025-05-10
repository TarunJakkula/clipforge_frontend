import axios from "axios";
import { parseCookies } from "nookies";
import nookies from "nookies";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const cookies = parseCookies();
    const token = cookies.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    const newToken = response.headers["x-new-access-token"];
    if (newToken) {
      document.cookie = `accessToken=${newToken}; path=/; max-age=${
        60 * 60 * 24
      };`;
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 498) {
      nookies.destroy(null, "accessToken", { path: "/" });
      window.location.href = "/flows?invalid_token=true";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
