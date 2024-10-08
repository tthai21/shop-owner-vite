import { useNavigate } from "react-router";

const SessionExpired: React.FC = () => {
  const navigate = useNavigate();
  const handleLoginRedirect = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("storeUuid");
    navigate("/login");
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Session Expired</h1>
      <p className="mb-6 text-center">
        Your session has expired. This may have occurred due to inactivity.
        Please use the button below to log in.
      </p>
      <button
        onClick={handleLoginRedirect}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Log In
      </button>
    </div>
  );
};

export default SessionExpired;
