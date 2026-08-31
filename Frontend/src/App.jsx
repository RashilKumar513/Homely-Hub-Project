import "./App.css";

import Main from "./components/home/Main";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PropertyList from "./components/home/PropertyList";
import PropertyListing from "./components/propertyListing/PropertyListing";

import Login from "./components/user/Login";
import Signup from "./components/user/Signup";
import ForgotPassword from "./components/user/ForgotPassword";
import ResetPassword from "./components/user/ResetPassword";
import UpdatePassword from "./components/user/UpdatePassword";
import HostLogin from "./components/host/HostLogin";
import HostDashboard from "./components/host/HostDashboard";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { userActions } from "./store/User/user-slice";
import { currentUser, checkSessionSilent } from "./store/User/user-action";
import { fetchWishlist } from "./store/Wishlist/wishlist-action";
import Profile from "./components/user/Profile";
import EditProfile from "./components/user/EditProfile";
import Wishlist from "./components/user/Wishlist";

import BookingDetails from "./components/myBookings/BookingDetails";
import MyBookings from "./components/myBookings/MyBookings";
import Payment from "./components/payment/Payment";
import NotFound from "./components/NotFound";

import Accomodation from "./components/accomodation/Accomodation";
import AccomodationForm from "./components/accomodation/AccomodationForm";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const dispatch = useDispatch();
  const { errors, isAuthenticated, user, loading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(currentUser());
  }, [dispatch]);

  useEffect(() => {
    let interval;
    if (isAuthenticated) {
      dispatch(fetchWishlist());
      interval = setInterval(() => {
        dispatch(checkSessionSilent());
      }, 4000); // 4-SECOND SILENT BACKGROUND DELETED ACCOUNT SYNC (ZERO FLICKER)
    }
    return () => clearInterval(interval);
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (errors) {
      dispatch(userActions.clearErrors());
    }
  }, [dispatch, errors]);

  return (
    <ThemeProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Main />}>
              <Route index element={user && user.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : user && user.role === 'host' ? <Navigate to="/host/dashboard" replace /> : <PropertyList />} />
              <Route path="propertylist/:id" element={<PropertyListing />} />

              {/* 👤 USER Auth Routes */}
              <Route path="login" element={<Login />} />
              <Route path="user/login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="forgotpassword" element={<ForgotPassword />} />
              <Route path="reset-password/:token" element={<ResetPassword />} />
              <Route path="resetPassword/:token" element={<ResetPassword />} />
              <Route path="user/resetPassword/:token" element={<ResetPassword />} />
              <Route path="profile" element={<Profile />} />
              <Route path="editprofile" element={user ? <EditProfile /> : <Navigate to="/login" />} />
              <Route path="user/updatepassword" element={user ? <UpdatePassword /> : <Navigate to="/login" />} />
              <Route path="user/updatePassword" element={user ? <UpdatePassword /> : <Navigate to="/login" />} />
              <Route path="updatepassword" element={user ? <UpdatePassword /> : <Navigate to="/login" />} />
              <Route path="user/wishlist" element={<Wishlist />} />

              {/* 🏡 HOST Auth Routes & Dashboard */}
              <Route path="host/login" element={user && (user.role === 'host' || user.role === 'admin') ? <Navigate to="/host/dashboard" replace /> : <HostLogin />} />
              <Route path="host/dashboard" element={user && (user.role === 'host' || user.role === 'admin') ? <HostDashboard /> : loading ? <div style={{ textAlign: 'center', padding: '5rem 0' }}><div className="spinner-border text-danger" role="status"></div></div> : <Navigate to="/host/login" replace />} />

              {/* 🛡️ ADMIN Auth Routes & Dashboard */}
              <Route path="admin/login" element={user && user.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />} />
              <Route path="admin/dashboard" element={user && user.role === 'admin' ? <AdminDashboard /> : loading ? <div style={{ textAlign: 'center', padding: '5rem 0' }}><div className="spinner-border text-primary" role="status"></div></div> : <Navigate to="/admin/login" replace />} />

              {/* Booking routes  */}
              <Route path="user/mybookings" element={user ? <MyBookings /> : <Navigate to="/login" />} />
              <Route path="user/myBookings" element={user ? <MyBookings /> : <Navigate to="/login" />} />
              <Route path="user/mybookings/:bookingId" element={user ? <BookingDetails /> : <Navigate to="/login" />} />
              <Route path="user/myBookings/:bookingId" element={user ? <BookingDetails /> : <Navigate to="/login" />} />

              {/* Payment Route */}
              <Route path="payment/:propertyId" element={user ? <Payment /> : <Navigate to="/login" />} />

              {/* Accomodation Routes (Strict Admin & Host Authorization Only) */}
              <Route path="accomodation" element={user && (user.role === 'admin' || user.role === 'host') ? <Accomodation /> : <Navigate to="/" />} />
              <Route path="accomodationform" element={user && (user.role === 'admin' || user.role === 'host') ? <AccomodationForm /> : <Navigate to="/" />} />

              {/* 404 Not found */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;
