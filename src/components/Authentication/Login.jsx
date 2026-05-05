import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8000/users/login",
        { email, password }
      );

      // ✅ store full user data
      const { token, role, username, email: userEmail } = res.data;

      localStorage.setItem(
        "user",
        JSON.stringify({
          token,
          role,
          username,
          email: userEmail,
        })
      );

      setError("");

      // 🔥 trigger navbar update everywhere
      window.dispatchEvent(new Event("userChanged"));

      navigate("/");

    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="flex flex-col w-100 p-6 shadow-xl rounded-2xl gap-4">

        <h1 className="text-2xl text-center text-gray-700 font-semibold">
          Login
        </h1>

        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm rounded px-3 py-2 shadow focus:outline-none focus:ring-2 focus:ring-[#0E334D]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm rounded px-3 py-2 shadow focus:outline-none focus:ring-2 focus:ring-[#0E334D]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#0E334D] text-white p-2 rounded hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;