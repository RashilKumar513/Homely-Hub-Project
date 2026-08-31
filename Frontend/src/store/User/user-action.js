import { axiosInstance } from "../../utils/axios";
import { userActions } from "./user-slice";
import toast from "react-hot-toast";

// Unified Portal Login Action (Host & Admin)
export const portalLoginAction = (credentials) => async (dispatch) => {
  try {
    dispatch(userActions.getLoginRequest());
    const { data } = await axiosInstance.post("/v1/rent/user/portal-login", credentials);
    dispatch(userActions.getLoginDetails(data.user));
    if (data.user?.role === 'host') {
      toast.success("Welcome to Host Portal! 🏡");
    } else if (data.user?.role === 'admin') {
      toast.success("Admin Authorization Granted 🛡️");
    } else {
      toast.success("Logged in successfully 🎉");
    }
  } catch (error) {
    dispatch(userActions.getError(error.response?.data?.message || "Invalid Credentials. Please check password."));
  }
};

// Legacy User Signup
export const getSignup = (user) => async (dispatch) => {
  try {
    dispatch(userActions.getSignupRequest());
    const { data } = await axiosInstance.post("/v1/rent/user/signup", user);
    dispatch(userActions.getCurrentUser(data.user));
    toast.success("Account created successfully! 🎉");
  } catch (error) {
    dispatch(userActions.getError(error.response?.data?.message || "Failed to signup"));
  }
};

// Legacy User Login
export const getLogin = (user) => async (dispatch) => {
  try {
    dispatch(userActions.getLoginRequest());
    const { data } = await axiosInstance.post("/v1/rent/user/login", user);
    dispatch(userActions.getLoginDetails(data.user));
  } catch (error) {
    dispatch(userActions.getError(error.response?.data?.message || "Failed to login"));
  }
};

// Send Email OTP Action
export const sendEmailOTPAction = (email) => async (dispatch) => {
  try {
    dispatch(userActions.getLoginRequest());
    const { data } = await axiosInstance.post("/v1/rent/user/send-email-otp", { email });
    dispatch(userActions.clearErrors());
    dispatch(userActions.setOtpSent(true));

    if (data.demoOtp) {
      toast(`📧 REAL-TIME EMAIL INBOX (${email}):\n"Your Homely Hub login OTP code is: ${data.demoOtp}. Valid for 15 mins."`, {
        duration: 12000,
        style: {
          borderRadius: '16px',
          background: '#0f172a',
          color: '#ffffff',
          border: '1px solid #ff385c',
          fontWeight: '700',
          padding: '14px 18px',
          whiteSpace: 'pre-line',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        },
      });
    } else {
      toast.success(`Verification OTP code sent to ${email}! 📧`);
    }
  } catch (error) {
    dispatch(userActions.getError(error.response?.data?.message || "Failed to send Email OTP"));
  }
};

// Verify Email OTP Action
export const verifyEmailOTPAction = (email, otp) => async (dispatch) => {
  try {
    dispatch(userActions.getLoginRequest());
    const { data } = await axiosInstance.post("/v1/rent/user/verify-email-otp", { email, otp });
    dispatch(userActions.getLoginDetails(data.user));
    toast.success("Email OTP Verified! Logged in successfully 🎉");
  } catch (error) {
    dispatch(userActions.getError(error.response?.data?.message || "Invalid OTP Code"));
  }
};

// Send SMS OTP Action
export const sendSMSOTPAction = (phoneNumber) => async (dispatch) => {
  try {
    dispatch(userActions.getLoginRequest());
    const { data } = await axiosInstance.post("/v1/rent/user/send-otp", { phoneNumber });
    dispatch(userActions.clearErrors());
    dispatch(userActions.setOtpSent(true));

    if (data.demoOtp) {
      toast(`📱 REAL-TIME MOBILE SMS (+91 ${phoneNumber}):\n"Your Homely Hub login OTP code is: ${data.demoOtp}. Valid for 15 mins."`, {
        duration: 12000,
        style: {
          borderRadius: '16px',
          background: '#0f172a',
          color: '#ffffff',
          border: '1px solid #10b981',
          fontWeight: '700',
          padding: '14px 18px',
          whiteSpace: 'pre-line',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        },
      });
    } else {
      toast.success(`SMS OTP sent to +91 ${phoneNumber}!`);
    }
  } catch (error) {
    dispatch(userActions.getError(error.response?.data?.message || "Failed to send OTP"));
  }
};

// Verify SMS OTP Action
export const verifySMSOTPAction = (phoneNumber, otp) => async (dispatch) => {
  try {
    dispatch(userActions.getLoginRequest());
    const { data } = await axiosInstance.post("/v1/rent/user/verify-otp", { phoneNumber, otp });
    dispatch(userActions.getLoginDetails(data.user));
    toast.success("Mobile OTP Verified! Logged in successfully 🎉");
  } catch (error) {
    dispatch(userActions.getError(error.response?.data?.message || "Invalid OTP Code"));
  }
};

// Admin Login Action
export const adminLoginAction = (credentials) => async (dispatch) => {
  try {
    dispatch(userActions.getLoginRequest());
    const { data } = await axiosInstance.post("/v1/rent/user/admin-login", credentials);
    dispatch(userActions.getLoginDetails(data.user));
    toast.success("Admin Authorization Granted 🛡️");
  } catch (error) {
    dispatch(userActions.getError(error.response?.data?.message || "Invalid Admin Credentials"));
  }
};

export const currentUser = () => async (dispatch) => {
  try {
    dispatch(userActions.getCurrentUserRequest());
    const { data } = await axiosInstance.get("/v1/rent/user/me");
    dispatch(userActions.getCurrentUser(data.user));
  } catch (error) {
    dispatch(userActions.getError(error.response?.data?.message || ""));
  }
};

export const updateUser = (updateData) => async (dispatch) => {
  try {
    dispatch(userActions.getUpdateUserRequest());
    const res = await axiosInstance.patch("/v1/rent/user/updateMe", updateData);
    let updatedUser = res.data.user || res.data.data?.user;
    if (!updatedUser) {
      const meRes = await axiosInstance.get("/v1/rent/user/me");
      updatedUser = meRes.data.user;
    }
    dispatch(userActions.getCurrentUser(updatedUser));
    return updatedUser;
  } catch (error) {
    dispatch(userActions.getError(error.response?.data?.message || "Failed to update profile"));
    throw error;
  }
};

export const forgotPassword = (email) => async (dispatch) => {
  try {
    await axiosInstance.post("/v1/rent/user/forgotPassword", { email });
  } catch (error) {
    dispatch(userActions.getError(error.response?.data?.message || "Failed to process request"));
  }
};

export const resetPassword = (repassword, token) => async (dispatch) => {
  try {
    await axiosInstance.patch(`/v1/rent/user/resetPassword/${token}`, repassword);
  } catch (error) {
    dispatch(userActions.getError(error.response?.data?.message || "Failed to reset password"));
  }
};

export const updatePassword = (passwords) => async (dispatch) => {
  try {
    dispatch(userActions.getPasswordRequest());
    await axiosInstance.patch("/v1/rent/user/updateMyPassword", passwords);
    dispatch(userActions.getPasswordSuccess(true));
  } catch (error) {
    dispatch(userActions.getError(error.response?.data?.message || "Failed to update password"));
  }
};

export const logout = () => async (dispatch) => {
  try {
    await axiosInstance.get("/v1/rent/user/logout");
    dispatch(userActions.getLogout(null));
  } catch (error) {
    dispatch(userActions.getError(error.response?.data?.message || "Failed to logout"));
  }
};
