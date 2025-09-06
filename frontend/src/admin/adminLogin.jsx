import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.adminToken) {
        localStorage.setItem("adminToken", data.adminToken);
        navigate("/admin-dashboard", { replace: true });
      } else {
        localStorage.removeItem("adminToken");
        setError("Invalid credentials.");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-md w-full p-10 bg-white shadow-md border border-gray-300 rounded-xl">
        <h2 className="mb-8 text-center text-3xl font-extrabold tracking-tight font-serif text-gray-900 select-none">
          Admin Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-semibold text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              disabled={loading}
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition sm:text-base"
              aria-invalid={error ? "true" : undefined}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-semibold text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              disabled={loading}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition sm:text-base"
              aria-invalid={error ? "true" : undefined}
            />
          </div>
          {error && (
            <p
              role="alert"
              className="mt-2 text-center text-sm text-red-600 font-medium"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-6 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="mr-3 h-6 w-6 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
