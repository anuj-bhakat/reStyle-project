import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [activeSection, setActiveSection] = useState("profile"); // "profile" or "password"
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
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setProfileError("No token found. Please login.");
        return;
      }
      try {
        const response = await axios.get("http://localhost:3000/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
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
      } catch {
        setProfileError("Failed to load profile.");
      }
    };
    fetchUser();
  }, []);

  // Handlers for Profile form fields
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditableUser((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Profile updates
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");

    if (!editableUser.first_name || !editableUser.last_name || !editableUser.phone) {
      setProfileError("First name, last name, and phone are required.");
      setProfileLoading(false);
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(editableUser.phone)) {
      setProfileError("Phone must be a 10-digit number.");
      setProfileLoading(false);
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
      await axios.put(
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
          headers: { Authorization: `Bearer ${token}` },
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
      setProfileSuccess("Profile updated successfully!");
    } catch {
      setProfileError("Failed to update profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Handlers for password input fields
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordError("All password fields are required.");
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      setPasswordLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:3000/user/${user.id}/change-password`,
        {
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPasswordSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      setPasswordError("Failed to change password. Please check your current password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Use admin login password input style in password fields
  const inputClass =
    "w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition sm:text-base";

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>

      {/* Navigation Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveSection("profile")}
          className={`px-4 py-2 rounded-md font-semibold ${
            activeSection === "profile"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveSection("password")}
          className={`px-4 py-2 rounded-md font-semibold ${
            activeSection === "password"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Change Password
        </button>
      </div>

      {/* Profile Form */}
      {activeSection === "profile" && (
        <>
          {profileError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{profileError}</div>
          )}
          {profileSuccess && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{profileSuccess}</div>
          )}
          <form onSubmit={handleSaveProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <input
                  type="text"
                  value={user.gender || ""}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border rounded-md bg-gray-100"
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
                  className={inputClass}
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
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={editableUser.phone}
                  onChange={handleProfileChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Plot / House</label>
                <input
                  type="text"
                  name="plot"
                  value={editableUser.plot}
                  onChange={handleProfileChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Colony / Street</label>
                <input
                  type="text"
                  name="colony"
                  value={editableUser.colony}
                  onChange={handleProfileChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="city"
                  value={editableUser.city}
                  onChange={handleProfileChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  name="country"
                  value={editableUser.country}
                  onChange={handleProfileChange}
                  className={inputClass}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={profileLoading}
              className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {profileLoading ? "Updating..." : "Save Changes"}
            </button>
          </form>
        </>
      )}

      {/* Change Password Form */}
      {activeSection === "password" && (
        <>
          {passwordError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{passwordSuccess}</div>
          )}
          <form onSubmit={handleChangePassword}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Password *
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  required
                  className={inputClass}
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
                  onChange={handlePasswordInputChange}
                  required
                  className={inputClass}
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
                  onChange={handlePasswordInputChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {passwordLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Profile;
