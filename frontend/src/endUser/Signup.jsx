import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [step, setStep] = useState(1); // 1 = signup, 2 = address
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    gender: '',
    password: '',
  });

  const [addressData, setAddressData] = useState({
    phone: '',
    plot: '',
    colony: '',
    city: '',
    country: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post(`${baseUrl}/user/signup`, {
        ...formData,
        phone: null,
      });

      if (response.status === 201) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userid", response.data.id);
        setUserId(response.data.id);
        setToken(response.data.token);
        setStep(2);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error;
      setError(`❌ ${errorMsg}`);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!addressData.phone.trim()) {
      setError('❌ Phone number is required');
      return;
    }

    try {
      const response = await axios.put(
        `${baseUrl}/user/${userId}/address`,
        { ...addressData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setMessage('🎉 Signup complete and address saved!');
        setTimeout(() => {
          navigate("/home");
        }, 1500);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          gender: '',
          password: '',
        });
        setAddressData({
          phone: '',
          plot: '',
          colony: '',
          city: '',
          country: '',
        });
        setStep(1);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to save address';
      setError(`❌ ${errorMsg}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/50 transition-all duration-500">
        <div className="text-center mb-5">
          <div className="mx-auto h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
            <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            {step === 1 ? 'Create Account' : 'Add Contact Info'}
          </h2>
          <p className="mt-1 text-xs text-gray-600">
            {step === 1 ? 'Join us to explore sustainable fashion' : 'Where should we send your orders?'}
          </p>
        </div>

        <form onSubmit={step === 1 ? handleUserSubmit : handleAddressSubmit} className="space-y-6">
          {step === 1 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleFormChange}
                  icon={<UserIcon />}
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleFormChange}
                  icon={<UserIcon />}
                />
              </div>
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                icon={<MailIcon />}
              />

              <div className="relative">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon />
                  </div>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                    required
                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50/50 transition-colors duration-200"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleFormChange}
                icon={<LockIcon />}
              />
            </>
          ) : (
            <>
              <Input
                label="Phone Number"
                name="phone"
                value={addressData.phone}
                onChange={handleAddressChange}
                required
                icon={<PhoneIcon />}
              />
              <Input
                label="Plot / House"
                name="plot"
                value={addressData.plot}
                onChange={handleAddressChange}
                icon={<HomeIcon />}
              />
              <Input
                label="Colony / Street"
                name="colony"
                value={addressData.colony}
                onChange={handleAddressChange}
                icon={<MapIcon />}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="City"
                  name="city"
                  value={addressData.city}
                  onChange={handleAddressChange}
                  icon={<CityIcon />}
                />
                <Input
                  label="Country"
                  name="country"
                  value={addressData.country}
                  onChange={handleAddressChange}
                  icon={<GlobeIcon />}
                />
              </div>
            </>
          )}

          {message && (
            <div className="text-green-600 text-sm bg-green-50 px-4 py-2 rounded-lg border border-green-100 flex items-center justify-center">
              {message}
            </div>
          )}
          {error && (
            <div className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-100 flex items-center justify-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {step === 1 ? 'Next Step' : 'Complete Signup'}
          </button>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition-all duration-200"
              >
                Already have an account? Log in
              </button>
            </div>
            <div className="text-sm">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="font-medium text-gray-500 hover:text-gray-700 hover:underline transition-all duration-200 flex items-center"
              >
                <span className="mr-1">←</span> Back to Home
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable Input Component with Icon Support
const Input = ({ label, name, value, onChange, type = 'text', required = true, icon }) => (
  <div className="relative">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50/50 transition-colors duration-200 ${icon ? 'pl-10' : ''}`}
      />
    </div>
  </div>
);

// Icons
const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const MailIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const LockIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const PhoneIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const HomeIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const MapIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const CityIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const GlobeIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


export default Signup;
