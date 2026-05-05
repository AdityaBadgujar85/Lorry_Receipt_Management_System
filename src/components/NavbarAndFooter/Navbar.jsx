import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../img/logo.png";
import profile from "../img/profile.png";
import ganpati from "../img/ganpati.png";

export const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // ✅ Load user + listen for updates
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    loadUser();

    // 🔥 custom event for instant update
    window.addEventListener("userChanged", loadUser);

    return () => {
      window.removeEventListener("userChanged", loadUser);
    };
  }, []);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
    };

    if (showDropdown) {
      window.addEventListener("click", handleClickOutside);
    }

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    localStorage.removeItem("user");

    // 🔥 update navbar instantly
    window.dispatchEvent(new Event("userChanged"));

    navigate("/login");
  };

  return (
    <>
      {/* TOP NAV */}
      <nav className="flex justify-between items-center py-2 px-4">

        <div className="w-[33%]">
          <Link to="/">
            <img src={logo} alt="" className="w-100" />
          </Link>
        </div>

        <div className="w-[33%] flex justify-center">
          <img src={ganpati} alt="" className="w-15" />
        </div>

        <div className="w-[33%] flex justify-end items-center gap-5 relative">

          <img
            src={profile}
            alt=""
            className="w-10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation(); // 🔥 prevent auto close
              setShowDropdown(!showDropdown);
            }}
          />

          {showDropdown && (
            <div
              className="absolute top-12 right-0 bg-white shadow-lg rounded-lg p-3 w-52 z-50"
              onClick={(e) => e.stopPropagation()} // 🔥 prevent closing inside
            >

              {!user ? (
                <div className="flex flex-col gap-2 text-sm">
                  <Link to="/login">Login</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2 text-sm">

                  <p className="font-semibold">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-blue-500">{user.role}</p>

                  <hr />

                  <button
                    onClick={handleLogout}
                    className="text-red-500 text-left"
                  >
                    Logout
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      </nav>

      {/* SECOND NAV */}
      <nav className="flex justify-between items-center p-4 bg-[#0E334D]">
        <ul className="flex gap-16 text-white">

          <li><Link to="/">Generate LR</Link></li>
          <li><Link to="/tripdata">Trip Data</Link></li>
          {user?.role === "admin" && (
          <li>
            <Link to="/billing">Billing</Link>
          </li>
        )}
          <li><Link to="/expense">Expense</Link></li>
          {/* ADMIN ONLY */}
          {user?.role === "admin" && (
            <li>
              <Link to="/users">User Management</Link>
            </li>
          )}

        </ul>
      </nav>
    </>
  );
};