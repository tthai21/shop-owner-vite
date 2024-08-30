import "./App.css";
import Main from "./layout/Main.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import StaffsPage from "./pages/StaffsPage.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import googleOAuthConfig from "./config/googleOAuthConfig";
import SignUpPage from "./pages/SignupPage.tsx";
import ServiceTypePage from "./pages/ServiceTypePage.tsx";
import SessionExpired from "./pages/SessionExpiredPage.tsx";
import EmailConfirmationPage from "./pages/EmailConfirmationPage.tsx";
import ResetPasswordVerificationPage from "./pages/ResetPasswordVerificationPage.tsx";
import PasswordResetPage from "./pages/PasswordResetPage.tsx";
import ManageReservationsPage from "./pages/ManageReservationsPage.tsx";
import CreateStorePage from "./pages/CreateStorePage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />, // Use Main layout
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "services",
        element: <ServiceTypePage />,
      },
      {
        path: "create-store",
        element: <CreateStorePage />,
      },
      {
        path: "manage-bookings",
        element: <ManageReservationsPage />,
      },
      {
        path: "staffs",
        element: <StaffsPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "signup",
        element: <SignUpPage />,
      },
      {
        path: "session-expired",
        element: <SessionExpired />,
      },
      {
        path: "email-confirmation",
        element: <EmailConfirmationPage />,
      },
      {
        path: "reset-password-verification",
        element: <ResetPasswordVerificationPage />,
      },
      {
        path: "password-reset",
        element: <PasswordResetPage />,
      },
      {
        path: "404",
        element: <NotFoundPage />, // Add the NotFoundPage route
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ],
  },
]);

function App() {
  return (
    <GoogleOAuthProvider clientId={googleOAuthConfig.clientId}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  );
}

export default App;
