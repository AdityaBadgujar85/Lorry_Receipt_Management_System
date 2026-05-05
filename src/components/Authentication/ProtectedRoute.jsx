import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null); // null = unknown
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setIsAuth(true);
    } else {
      setIsAuth(false);
    }

    setLoading(false);
  }, []);

  // 🚫 wait before decision
  if (loading) {
    return <div>Checking authentication...</div>;
  }

  // 🔒 block if not logged in
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // ✅ allow access
  return children;
};

export default ProtectedRoute;