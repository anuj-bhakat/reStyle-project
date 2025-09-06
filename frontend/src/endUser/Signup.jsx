import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Added for navigation

const Signup = () => {
  const [step, setStep] = useState(1); // 1 = signup, 2 = address
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
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

  const navigate = useNavigate(); // Initialize useNavigate

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
      const response = await axios.post('http://localhost:3000/user/signup', {
        ...formData,
        phone: null,
      });

      if (response.status === 201) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userid", response.data.id);
        setUserId(response.data.id);
        setToken(response.data.token); // Save token
        setStep(2); // Move to address step
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
        `http://localhost:3000/user/${userId}/address`,
        { ...addressData },
        {
          headers: {
            Authorization: `Bearer ${token}`, // send auth token
          },
        }
      );

      if (response.status === 200) {
        setMessage('🎉 Signup complete and address saved!');
        // Redirect to dashboard after successful signup
        setTimeout(() => {
          // navigate('/userDashboard');
          navigate("/home");
        }, 1500); // Small delay to show success message
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-white px-4">
      <form
        onSubmit={step === 1 ? handleUserSubmit : handleAddressSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-5 transition-all duration-500"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          {step === 1 ? 'Create Account' : 'Add Contact Info'}
        </h2>

        {step === 1 ? (
          <>
            <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleFormChange} />
            <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleFormChange} />
            <Input label="Email" type="email" name="email" value={formData.email} onChange={handleFormChange} />

            {/* Gender Dropdown */}
            <div className="space-y-1">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Input label="Password" type="password" name="password" value={formData.password} onChange={handleFormChange} />
          </>
        ) : (
          <>
            <Input label="Phone Number" name="phone" value={addressData.phone} onChange={handleAddressChange} required />
            <Input label="Plot / House" name="plot" value={addressData.plot} onChange={handleAddressChange} />
            <Input label="Colony / Street" name="colony" value={addressData.colony} onChange={handleAddressChange} />
            <Input label="City" name="city" value={addressData.city} onChange={handleAddressChange} />
            <Input label="Country" name="country" value={addressData.country} onChange={handleAddressChange} />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition duration-300"
        >
          {step === 1 ? 'Next' : 'Submit'}
        </button>

        {message && <p className="text-green-600 text-sm text-center font-medium">{message}</p>}
        {error && <p className="text-red-600 text-sm text-center font-medium">{error}</p>}
      </form>
    </div>
  );
};

// Reusable Input Component
const Input = ({ label, name, value, onChange, type = 'text', required = true }) => (
  <div className="space-y-1">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>
);

export default Signup;
