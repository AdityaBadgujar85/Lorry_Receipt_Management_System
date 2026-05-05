import "./App.css";
import { Navbar } from "./components/NavbarAndFooter/Navbar";
import { Footer } from "./components/NavbarAndFooter/Footer";
import Login from "./components/Authentication/Login";
import UserManagement from "./components/Authentication/UserManagement";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Tripdata from "./components/TripData/TripData";
import Billing from "./components/Billing/Billing";
import LR_Page from "./components/Homepage/LR_Page";
import PrintLR from "./components/Homepage/PrintLR";
import PrintBill from "./components/Billing/PrintBill";
import ProtectedRoute from "./components/Authentication/ProtectedRoute";
import ExpensePage from "./components/ExpensePage/ExpensePage"; // ✅ ADD THIS

import { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // 🔄 Load user from localStorage
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
      setLoading(false);
    };

    loadUser();
    window.addEventListener("userChanged", loadUser);

    return () => {
      window.removeEventListener("userChanged", loadUser);
    };
  }, []);

  // ⛔ Prevent early render
  if (loading) {
    return <div>Loading...</div>;
  }

  // ✅ Hide navbar/footer on print page
  const isPrintPage = location.pathname === "/print";

  // ✅ Handle Print Pages Dynamically
  const renderPrintPage = () => {
    const state = location.state;

    if (state?.type === "LR") return <PrintLR />;
    if (state?.type === "BILL") return <PrintBill />;

    return <div>No Print Data Found</div>;
  };

  return (
    <div className="app-wrapper flex flex-col min-h-screen">

      {/* 🔝 NAVBAR */}
      {!isPrintPage && <Navbar />}

      <main className="flex grow justify-center">
        <Routes>

          {/* 🌐 PUBLIC */}
          <Route path="/login" element={<Login />} />

          {/* 🔒 ADMIN ONLY */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                {user?.role === "admin" ? (
                  <UserManagement />
                ) : (
                  <Navigate to="/" replace />
                )}
              </ProtectedRoute>
            }
          />

          {/* 🔒 PROTECTED ROUTES */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LR_Page />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tripdata"
            element={
              <ProtectedRoute>
                <Tripdata />
              </ProtectedRoute>
            }
          />

          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                {user?.role === "admin" ? (
                  <Billing />
                ) : (
                  <Navigate to="/" replace />
                )}
              </ProtectedRoute>
            }
          />

          {/* ✅ NEW EXPENSE ROUTE */}
          <Route
            path="/expense"
            element={
              <ProtectedRoute>
                <ExpensePage />
              </ProtectedRoute>
            }
          />

          {/* 🖨 PRINT ROUTE */}
          <Route
            path="/print"
            element={
              <ProtectedRoute>
                {renderPrintPage()}
              </ProtectedRoute>
            }
          />

        </Routes>
      </main>

      {/* 🔻 FOOTER */}
      {!isPrintPage && <Footer />}

    </div>
  );
}

export default App;