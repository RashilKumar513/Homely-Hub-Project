import axios from "axios";
import qs from "qs";
import toast from "react-hot-toast";

export const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "";
    const isDeleted = error.response?.data?.accountDeleted || message.includes("no longer exists");

    if (error.response?.status === 401 && isDeleted) {
      toast.error("Your account has been deleted. Logging out and returning to home page...", {
        id: "account-deleted-toast",
        duration: 4000,
      });

      localStorage.clear();
      sessionStorage.clear();

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);
