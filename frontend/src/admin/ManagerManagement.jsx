import React, { useState, useEffect } from 'react';

// Reusable Input Component
const Input = ({ label, name, value, onChange, type = 'text', placeholder }) => (
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
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>
);

const ManagerManagement = () => {
  const [formData, setFormData] = useState({ 
    manager_id: '', 
    name: '', 
    email: '', 
    password: '', 
    phone: '' 
  });
  const [editData, setEditData] = useState({ 
    id: '', 
    manager_id: '', 
    name: '', 
    email: '', 
    password: '', 
    phone: '' 
  });
  const [managers, setManagers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showList, setShowList] = useState(true);

  const API_BASE_URL = 'http://localhost:3000/managers';
  const adminToken = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    setIsLoadingManagers(true);
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setManagers(data || []);
    } catch (err) {
      setError(`Error fetching managers: ${err.message}`);
    } finally {
      setIsLoadingManagers(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    if (!adminToken) {
      setError('❌ Admin token required');
      setIsLoading(false);
      return;
    }

    try {
      if (!formData.manager_id.trim() || !formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.phone.trim()) {
        throw new Error('All fields are required');
      }

      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          manager_id: formData.manager_id.trim(),
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create manager');
      }

      const result = await response.json();
      
      // Add the new manager to the list
      const newManager = {
        id: Date.now(),
        manager_id: formData.manager_id.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        created_at: new Date().toISOString()
      };
      
      setManagers(prev => [...prev, newManager]);
      setFormData({ manager_id: '', name: '', email: '', password: '', phone: '' });
      setShowAddForm(false);
      setShowList(true);
      setMessage('🎉 Manager created successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(`❌ ${err.message}`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    if (!adminToken) {
      setError('❌ Admin token required');
      setIsLoading(false);
      return;
    }

    try {
      if (!editData.manager_id.trim() || !editData.name.trim() || !editData.email.trim() || !editData.phone.trim()) {
        throw new Error('Manager ID, name, email and phone are required');
      }

      // Only include password in the update if it's provided
      const updateData = {
        manager_id: editData.manager_id.trim(),
        name: editData.name.trim(),
        email: editData.email.trim(),
        phone: editData.phone.trim()
      };

      // Add password only if it's not empty
      if (editData.password && editData.password.trim()) {
        updateData.password = editData.password.trim();
      }

      const response = await fetch(`${API_BASE_URL}/${editData.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update manager');
      }

      await response.json();
      
      // Update the manager in the list
      setManagers(prev => prev.map(m => 
        m.id === editData.id ? {
          ...m,
          manager_id: editData.manager_id.trim(),
          name: editData.name.trim(),
          email: editData.email.trim(),
          phone: editData.phone.trim()
        } : m
      ));
      
      setEditData({ id: '', manager_id: '', name: '', email: '', password: '', phone: '' });
      setIsEditing(false);
      setShowList(true);
      setMessage('✅ Manager updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(`❌ ${err.message}`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteManager = async (managerId) => {
    if (!window.confirm('Are you sure you want to delete this manager?')) return;

    if (!adminToken) {
      setError('❌ Admin token required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${managerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete manager');
      }

      setManagers(prev => prev.filter(m => m.id !== managerId));
      setMessage('✅ Manager deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(`❌ ${err.message}`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const startEdit = (manager) => {
    console.log('Manager data for edit:', manager);
    setEditData({
      id: manager.id,
      manager_id: manager.manager_id || '',
      name: manager.name || '',
      email: manager.email || '',
      password: '', // Always start with empty password for edit
      phone: manager.phone || ''
    });
    setIsEditing(true);
    setShowAddForm(false);
    setShowList(false);
  };

  const cancelEdit = () => {
    setEditData({ id: '', manager_id: '', name: '', email: '', password: '', phone: '' });
    setIsEditing(false);
    setShowList(true);
  };

  const showAddFormHandler = () => {
    setShowAddForm(true);
    setShowList(false);
    setIsEditing(false);
  };

  const showListHandler = () => {
    setShowAddForm(false);
    setShowList(true);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white">
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-800">Manager Management</h1>
            <div className="flex space-x-4">
              <button
                onClick={showAddFormHandler}
                className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
                  showAddForm ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Add Manager
              </button>
              <button
                onClick={showListHandler}
                className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
                  showList ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                View Managers
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Manager</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Manager ID" name="manager_id" value={formData.manager_id} onChange={handleInputChange} placeholder="Enter manager ID" />
                <Input label="Name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter full name" />
                <Input label="Email" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email" />
                <Input label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter phone number" />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-center">
                <button type="submit" disabled={isLoading} className="w-48 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-6 rounded-lg font-semibold">
                  {isLoading ? 'Creating...' : 'Create Manager'}
                </button>
              </div>
            </form>
          </div>
        )}

        {isEditing && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-800 mb-4">Edit Manager</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Manager ID" name="manager_id" value={editData.manager_id} onChange={handleEditInputChange} placeholder="Enter manager ID" />
                <Input label="Name" name="name" value={editData.name} onChange={handleEditInputChange} placeholder="Enter full name" />
                <Input label="Email" type="email" name="email" value={editData.email} onChange={handleEditInputChange} placeholder="Enter email" />
                <Input label="Phone" name="phone" value={editData.phone} onChange={handleEditInputChange} placeholder="Enter phone number" />
              </div>
              <Input label="New Password (optional)" name="password" value={editData.password} onChange={handleEditInputChange} placeholder="Leave blank to keep current password" />
              <div className="flex justify-center gap-4">
                <button type="submit" disabled={isLoading} className="w-32 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white py-2 px-6 rounded-lg font-semibold">
                  {isLoading ? 'Updating...' : 'Update'}
                </button>
                <button type="button" onClick={cancelEdit} className="w-32 bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showList && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Managers</h2>
              <button onClick={fetchManagers} disabled={isLoadingManagers} className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg">
                {isLoadingManagers ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            {isLoadingManagers ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-500">Loading managers...</p>
              </div>
            ) : managers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No managers found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Manager ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managers.map(manager => (
                      <tr key={manager.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{manager.manager_id || 'N/A'}</td>
                        <td className="py-3 px-4">{manager.name || 'N/A'}</td>
                        <td className="py-3 px-4">{manager.email || 'N/A'}</td>
                        <td className="py-3 px-4">{manager.phone || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{manager.created_at ? new Date(manager.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button onClick={() => startEdit(manager)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">Edit</button>
                            <button onClick={() => handleDeleteManager(manager.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {message && (
          <div className="fixed top-20 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50">
            {message}
          </div>
        )}
        {error && (
          <div className="fixed top-20 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerManagement;