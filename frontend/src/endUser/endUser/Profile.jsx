import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [editableUser, setEditableUser] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    plot: "",
    colony: "",
    city: "",
    country: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login.");
        return;
      }
      try {
        const response = await axios.get("http://localhost:3000/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data.user;
        setUser(data);
        setEditableUser({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          plot: data.address?.plot || "",
          colony: data.address?.colony || "",
          city: data.address?.city || "",
          country: data.address?.country || "",
        });
      } catch (err) {
        setError("Failed to load profile.");
      }
    };
    fetchUser();
  }, []);

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditableUser((prev) => ({ ...prev, [name]: value }));
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Save profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Basic validation
    if (
      !editableUser.first_name ||
      !editableUser.last_name ||
      !editableUser.phone
    ) {
      setError("First name, last name, and phone are required.");
      setLoading(false);
      return;
    }

    // Phone validation (simple regex for digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(editableUser.phone)) {
      setError("Phone must be a 10-digit number.");
      setLoading(false);
      return;
    }

    const address = {
      plot: editableUser.plot,
      colony: editableUser.colony,
      city: editableUser.city,
      country: editableUser.country,
    };
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `http://localhost:3000/user/${user.id}/profile`,
        {
          ...user,
          first_name: editableUser.first_name,
          last_name: editableUser.last_name,
          email: user.email,
          gender: user.gender,
          phone: editableUser.phone,
          address: address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser({
        ...user,
        first_name: editableUser.first_name,
        last_name: editableUser.last_name,
        email: user.email,
        gender: user.gender,
        phone: editableUser.phone,
        address: address,
      });
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setError("All password fields are required.");
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New password and confirm password do not match.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `http://localhost:3000/user/${user.id}/change-password`,
        {
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      // setError(
      //   "Failed to change password. Please check your current password."
      //);
      console.error(err);
      
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const handleForgotPassword = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:3000/user/${user.id}/forgot-password`,
        { email: user.email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Password reset email sent!");
    } catch (err) {
      setError("Failed to send reset email.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Profile Form */}
      <button
        onClick={() => setShowProfileForm(!showProfileForm)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {showProfileForm
          ? "Hide Profile Information"
          : "Show Profile Information"}
      </button>
      {showProfileForm && (
        <form onSubmit={handleSaveProfile} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <input
                type="text"
                value={user.gender || ""}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={editableUser.first_name}
                onChange={handleProfileChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={editableUser.last_name}
                onChange={handleProfileChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={editableUser.phone}
                onChange={handleProfileChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Plot / House
              </label>
              <input
                type="text"
                name="plot"
                value={editableUser.plot}
                onChange={handleProfileChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Colony / Street
              </label>
              <input
                type="text"
                name="colony"
                value={editableUser.colony}
                onChange={handleProfileChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="city"
                value={editableUser.city}
                onChange={handleProfileChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={editableUser.country}
                onChange={handleProfileChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </form>
      )}

      {/* Change Password Section */}
      {showPasswordForm ? (
        <form onSubmit={handleChangePassword} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Password *
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password *
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPasswordForm(false);
                setShowProfileForm(true);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => {
            setShowPasswordForm(true);
            setShowProfileForm(false);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Change Password
        </button>
      )}

      {/* Forgot Password */}
      <div className="text-center">
        <button
          onClick={handleForgotPassword}
          className="text-indigo-600 hover:text-indigo-800 underline"
        >
          Forgot Password?
        </button>
      </div>
    </div>
  );
};

export default Profile;
