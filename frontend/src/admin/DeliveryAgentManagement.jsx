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

const DeliveryAgent = () => {
  const [formData, setFormData] = useState({ agentid: '', email: '', password: '' });
  const [editData, setEditData] = useState({ id: '', agentid: '', email: '', password: '' });
  const [agents, setAgents] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showList, setShowList] = useState(true);

  const baseUrl = import.meta.env.VITE_BASE_URL;
  const API_BASE_URL = `${baseUrl}/delivery-agent`;

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setIsLoadingAgents(true);
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setAgents(data || []);
    } catch (err) {
      setError(`Error fetching agents: ${err.message}`);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
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

    try {
      if (!formData.agentid.trim() || !formData.email.trim() || !formData.password.trim()) {
        throw new Error('Agent ID, email and password are required');
      }

      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentid: formData.agentid.trim(),
          email: formData.email.trim(),
          password: formData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create delivery agent');
      }

      const result = await response.json();
      setFormData({ agentid: '', email: '', password: '' });
      setShowAddForm(false);
      setShowList(true);
      setMessage('🎉 Delivery agent created successfully!');
      setTimeout(() => setMessage(''), 3000);

      // Auto-refresh the agent list
      fetchAgents();
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

    try {
      if (!editData.agentid.trim() || !editData.email.trim()) {
        throw new Error('Agent ID and email are required');
      }

      // Only include password in the update if it's provided
      const updateData = {
        agentid: editData.agentid.trim(),
        email: editData.email.trim()
      };

      // Add password only if it's not empty
      if (editData.password && editData.password.trim()) {
        updateData.password = editData.password.trim();
      }

      const response = await fetch(`${API_BASE_URL}/${editData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update delivery agent');
      }

      await response.json();
      setEditData({ id: '', agentid: '', email: '', password: '' });
      setIsEditing(false);
      setShowList(true);
      setMessage('✅ Delivery agent updated successfully!');
      setTimeout(() => setMessage(''), 3000);

      // Auto-refresh the agent list
      fetchAgents();
    } catch (err) {
      setError(`❌ ${err.message}`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (!window.confirm('Are you sure you want to delete this delivery agent?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${agentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete delivery agent');
      }

      setMessage('✅ Delivery agent deleted successfully!');
      setTimeout(() => setMessage(''), 3000);

      // Auto-refresh the agent list
      fetchAgents();
    } catch (err) {
      setError(`❌ ${err.message}`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (agent) => {
    console.log('Agent data for edit:', agent); // Debug log to see the actual structure
    setEditData({
      id: agent.deliveryagent_id || agent.id, // Try both field names
      agentid: agent.agentid || '',
      email: agent.email,
      password: '' // Always start with empty password for edit
    });
    setIsEditing(true);
    setShowAddForm(false);
    setShowList(false);
  };

  const cancelEdit = () => {
    setEditData({ id: '', agentid: '', email: '', password: '' });
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
            <h1 className="text-2xl font-bold text-gray-800">Delivery Agent Management</h1>
            <div className="flex space-x-4">
              <button
                onClick={showAddFormHandler}
                className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${showAddForm ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Add Agent
              </button>
              <button
                onClick={showListHandler}
                className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${showList ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                View Agents
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Delivery Agent</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Agent ID" name="agentid" value={formData.agentid} onChange={handleInputChange} placeholder="Enter agent ID" />
                <Input label="Email" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email" />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Generated password"
                      required
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button type="submit" disabled={isLoading} className="w-48 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-6 rounded-lg font-semibold">
                  {isLoading ? 'Creating...' : 'Create Delivery Agent'}
                </button>
              </div>
            </form>
          </div>
        )}

        {isEditing && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-800 mb-4">Edit Delivery Agent</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Agent ID" name="agentid" value={editData.agentid} onChange={handleEditInputChange} placeholder="Enter agent ID" />
                <Input label="Email" type="email" name="email" value={editData.email} onChange={handleEditInputChange} placeholder="Enter email" />
                <Input label="New Password (optional)" name="password" value={editData.password} onChange={handleEditInputChange} placeholder="Leave blank to keep current password" />
              </div>
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
              <h2 className="text-xl font-semibold text-gray-800">Delivery Agents</h2>
              <button onClick={fetchAgents} disabled={isLoadingAgents} className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg">
                {isLoadingAgents ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {isLoadingAgents ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-500">Loading delivery agents...</p>
              </div>
            ) : agents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No delivery agents found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Agent ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map(agent => {
                      // Use the correct ID field for the key and operations
                      const agentId = agent.deliveryagent_id || agent.id;
                      return (
                        <tr key={agentId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-800">{agent.agentid || 'N/A'}</td>
                          <td className="py-3 px-4">{agent.email}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{agent.created_at ? new Date(agent.created_at).toLocaleDateString() : 'N/A'}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button onClick={() => startEdit(agent)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">Edit</button>
                              <button onClick={() => handleDeleteAgent(agentId)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm">Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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

export default DeliveryAgent;
