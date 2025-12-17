import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Reusable Input Component
const Input = ({ label, name, value, onChange, type = "text", placeholder }) => (
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

// ManagerForm Component
const ManagerForm = ({ editing, formData, setFormData, onSubmit, onCancel, isLoading, message, error }) => (
  <form
    onSubmit={onSubmit}
    className="max-w-4xl mx-auto"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Input
        label="Manager ID"
        name="manager_id"
        value={formData.manager_id}
        onChange={(e) => setFormData((f) => ({ ...f, manager_id: e.target.value }))}
        placeholder="e.g. MGR001"
      />
      <Input
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
        placeholder="John Doe"
      />
      <Input
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
        placeholder="john@example.com"
      />
      <Input
        label="Phone Number"
        name="phone"
        value={formData.phone}
        onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
        placeholder="+1 (555) 000-0000"
      />
      <div className="md:col-span-2">
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
          placeholder={editing ? "Leave blank to keep current password" : "Enter a secure password"}
        />
      </div>
    </div>

    <div className="flex justify-end gap-4 border-t border-gray-100 pt-6">
      {editing && (
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors duration-200"
        >
          Cancel
        </button>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (editing ? "Updating..." : "Creating...") : editing ? "Update Manager" : "Create Manager"}
      </button>
    </div>

    {message && (
      <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        {message}
      </div>
    )}
    {error && (
      <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </div>
    )}
  </form>
);

// AgentForm Component
const AgentForm = ({
  editing,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isLoading,
  message,
  error,
}) => (
  <form
    onSubmit={onSubmit}
    className="max-w-4xl mx-auto"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Input
        label="Agent ID"
        name="agentid"
        value={formData.agentid}
        onChange={(e) =>
          setFormData((f) => ({ ...f, agentid: e.target.value }))
        }
        placeholder="e.g. AGTO001"
      />
      <Input
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
        placeholder="agent@example.com"
      />
      <div className="md:col-span-2">
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) =>
            setFormData((f) => ({ ...f, password: e.target.value }))
          }
          placeholder={editing ? "Leave blank to keep current password" : "Enter a secure password"}
        />
      </div>
    </div>

    <div className="flex justify-end gap-4 border-t border-gray-100 pt-6">
      {editing && (
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors duration-200"
        >
          Cancel
        </button>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (editing ? "Updating..." : "Creating...") : editing ? "Update Agent" : "Create Agent"}
      </button>
    </div>

    {message && (
      <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        {message}
      </div>
    )}
    {error && (
      <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </div>
    )}
  </form>
);

// ViewManagers Component
const ViewManagers = ({ onEdit, refresh, isGuest }) => {
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const API_BASE_URL = `${baseUrl}/managers`;
  const adminToken = localStorage.getItem("adminToken");

  const fetchManagers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.get(API_BASE_URL, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setManagers(res.data || []);
    } catch (err) {
      setError(`Error fetching managers: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, [refresh]);

  const handleDelete = async (managerId) => {
    if (isGuest) return;
    if (!window.confirm("Are you sure you want to delete this manager?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/${managerId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setManagers((prev) => prev.filter((m) => m.id !== managerId));
    } catch (err) {
      alert(`Error: ${err.response.data.error}`);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchManagers}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm"
        >
          <svg className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isLoading ? "Refreshing..." : "Refresh List"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {managers.length > 0 ? (
              managers.map((manager) => (
                <tr key={manager.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    {manager.manager_id || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{manager.name || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{manager.email || "N/A"}</div>
                    <div className="text-sm text-gray-500">{manager.phone || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {manager.created_at ? new Date(manager.created_at).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(manager)}
                      disabled={isGuest}
                      className={`mr-4 font-semibold hover:underline ${isGuest ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-900'}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(manager.id)}
                      disabled={isGuest}
                      className={`font-semibold hover:underline ${isGuest ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900'}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                  No managers found. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

// ViewAgents Component
const ViewAgents = ({ onEdit, refresh, isGuest }) => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const API_BASE_URL = `${baseUrl}/delivery-agent`;

  const fetchAgents = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.get(API_BASE_URL);
      setAgents(res.data || []);
    } catch (err) {
      setError(`Error fetching agents: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [refresh]);

  const handleDelete = async (agentId) => {
    if (isGuest) return;
    if (!window.confirm("Are you sure you want to delete this delivery agent?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/${agentId}`);
      setAgents((prev) => prev.filter((a) => (a.deliveryagent_id || a.id) !== agentId));
    } catch (err) {
      alert("Delete failed.");
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchAgents}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm"
        >
          <svg className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isLoading ? "Refreshing..." : "Refresh List"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agents.length > 0 ? (
              agents.map((agent) => {
                const agentId = agent.deliveryagent_id || agent.id;
                return (
                  <tr key={agentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      {agent.agentid || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agent.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agent.created_at ? new Date(agent.created_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onEdit(agent)}
                        disabled={isGuest}
                        className={`mr-4 font-semibold hover:underline ${isGuest ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-900'}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(agentId)}
                        disabled={isGuest}
                        className={`font-semibold hover:underline ${isGuest ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900'}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500">
                  No delivery agents found. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

// AdminDashboard Component
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState("addManager");
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const adminToken = localStorage.getItem("adminToken");
  const isGuest = localStorage.getItem("isGuest") === "true";

  const [refreshManagers, setRefreshManagers] = useState(false);
  const [refreshAgents, setRefreshAgents] = useState(false);

  const [editingManager, setEditingManager] = useState(null);
  const [editingAgent, setEditingAgent] = useState(null);

  const [managerAddForm, setManagerAddForm] = useState({
    manager_id: "",
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [managerMsg, setManagerMsg] = useState("");
  const [managerErr, setManagerErr] = useState("");
  const [managerLoading, setManagerLoading] = useState(false);

  const [agentAddForm, setAgentAddForm] = useState({
    agentid: "",
    email: "",
    password: "",
  });
  const [agentMsg, setAgentMsg] = useState("");
  const [agentErr, setAgentErr] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  // Manager Add Submission
  const handleManagerAddSubmit = async (e) => {
    e.preventDefault();
    setManagerLoading(true);
    setManagerMsg("");
    setManagerErr("");
    try {
      if (
        !managerAddForm.manager_id ||
        !managerAddForm.name ||
        !managerAddForm.email ||
        !managerAddForm.password ||
        !managerAddForm.phone
      )
        throw new Error("All fields are required");
      await axios.post(
        `${baseUrl}/managers/signup`,
        managerAddForm,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      setManagerAddForm({
        manager_id: "",
        name: "",
        email: "",
        password: "",
        phone: "",
      });
      setManagerMsg("🎉 Manager created!");
      setRefreshManagers((v) => !v);
      setTimeout(() => setManagerMsg(""), 3000);
    } catch (err) {
      setManagerErr(`❌ ${err.response?.data?.error || err.message}`);
      setTimeout(() => setManagerErr(""), 3000);
    }
    setManagerLoading(false);
  };

  // Manager Edit Submission
  const handleManagerEditSubmit = async (e) => {
    e.preventDefault();
    setManagerLoading(true);
    setManagerMsg("");
    setManagerErr("");
    const adminToken = localStorage.getItem("adminToken");
    try {
      if (
        !editingManager.manager_id ||
        !editingManager.name ||
        !editingManager.email ||
        !editingManager.phone
      )
        throw new Error("All fields except password are required");
      const updateData = {
        manager_id: editingManager.manager_id.trim(),
        name: editingManager.name.trim(),
        email: editingManager.email.trim(),
        phone: editingManager.phone.trim(),
      };
      if (editingManager.password && editingManager.password.trim())
        updateData.password = editingManager.password;
      await axios.put(
        `${baseUrl}/managers/${editingManager.id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      setEditingManager(null);
      setRefreshManagers((v) => !v);
      setManagerMsg("Manager updated!");
      setTimeout(() => setManagerMsg(""), 3000);
    } catch (err) {
      setManagerErr(`❌ ${err.response?.data?.error || err.message}`);
      setTimeout(() => setManagerErr(""), 3000);
    }
    setManagerLoading(false);
  };

  // Agent Add Submission
  const handleAgentAddSubmit = async (e) => {
    e.preventDefault();
    setAgentLoading(true);
    setAgentMsg("");
    setAgentErr("");
    try {
      if (!agentAddForm.agentid || !agentAddForm.email || !agentAddForm.password)
        throw new Error("Agent ID, email and password are required");
      await axios.post(`${baseUrl}/delivery-agent/signup`, agentAddForm,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      setAgentAddForm({ agentid: "", email: "", password: "" });
      setAgentMsg("🎉 Delivery agent created!");
      setRefreshAgents((v) => !v);
      setTimeout(() => setAgentMsg(""), 3000);
    } catch (err) {
      setAgentErr(`❌ ${err.response?.data?.error || err.message}`);
      setTimeout(() => setAgentErr(""), 3000);
    }
    setAgentLoading(false);
  };

  // Agent Edit Submission
  const handleAgentEditSubmit = async (e) => {
    e.preventDefault();
    setAgentLoading(true);
    setAgentMsg("");
    setAgentErr("");
    try {
      if (!editingAgent.agentid || !editingAgent.email)
        throw new Error("Agent ID and email are required");
      const updateData = {
        agentid: editingAgent.agentid,
        email: editingAgent.email,
      };
      if (editingAgent.password && editingAgent.password.trim())
        updateData.password = editingAgent.password;
      await axios.put(
        `${baseUrl}/delivery-agent/${editingAgent.id}`,
        updateData,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      setEditingAgent(null);
      setRefreshAgents((v) => !v);
      setAgentMsg("Delivery agent updated!");
      setTimeout(() => setAgentMsg(""), 3000);
    } catch (err) {
      setAgentErr(`❌ ${err.response?.data?.error || err.message}`);
      setTimeout(() => setAgentErr(""), 3000);
    }
    setAgentLoading(false);
  };

  // Tab pages and their components
  const pages = [
    {
      key: "addManager",
      label: "Add Manager",
      component: editingManager ? (
        <ManagerForm
          editing
          formData={editingManager}
          setFormData={setEditingManager}
          onSubmit={handleManagerEditSubmit}
          onCancel={() => setEditingManager(null)}
          isLoading={managerLoading}
          message={managerMsg}
          error={managerErr}
        />
      ) : (
        isGuest ? (
          <div className="p-8 text-center bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Restricted Access</h3>
            <p className="mt-2 text-sm text-gray-500">Creating managers is disabled in Guest Mode.</p>
          </div>
        ) : (
          <ManagerForm
            editing={false}
            formData={managerAddForm}
            setFormData={setManagerAddForm}
            onSubmit={handleManagerAddSubmit}
            isLoading={managerLoading}
            message={managerMsg}
            error={managerErr}
          />
        )
      ),
    },
    {
      key: "viewManagers",
      label: "View Managers",
      component: editingManager ? (
        <ManagerForm
          editing
          formData={editingManager}
          setFormData={setEditingManager}
          onSubmit={handleManagerEditSubmit}
          onCancel={() => setEditingManager(null)}
          isLoading={managerLoading}
          message={managerMsg}
          error={managerErr}
        />
      ) : (
        <ViewManagers
          key={refreshManagers}
          onEdit={(row) =>
            isGuest ? alert("Editing is disabled in Guest Mode") :
              setEditingManager({
                id: row.id,
                manager_id: row.manager_id,
                name: row.name,
                email: row.email,
                password: "",
                phone: row.phone,
              })
          }
          refresh={refreshManagers}
          isGuest={isGuest}
        />
      ),
    },
    {
      key: "addAgent",
      label: "Add Delivery Agent",
      component: editingAgent ? (
        <AgentForm
          editing
          formData={editingAgent}
          setFormData={setEditingAgent}
          onSubmit={handleAgentEditSubmit}
          onCancel={() => setEditingAgent(null)}
          isLoading={agentLoading}
          message={agentMsg}
          error={agentErr}
        />
      ) : (
        isGuest ? (
          <div className="p-8 text-center bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Restricted Access</h3>
            <p className="mt-2 text-sm text-gray-500">Creating agents is disabled in Guest Mode.</p>
          </div>
        ) : (
          <AgentForm
            editing={false}
            formData={agentAddForm}
            setFormData={setAgentAddForm}
            onSubmit={handleAgentAddSubmit}
            isLoading={agentLoading}
            message={agentMsg}
            error={agentErr}
          />
        )
      ),
    },
    {
      key: "viewAgents",
      label: "View Delivery Agents",
      component: editingAgent ? (
        <AgentForm
          editing
          formData={editingAgent}
          setFormData={setEditingAgent}
          onSubmit={handleAgentEditSubmit}
          onCancel={() => setEditingAgent(null)}
          isLoading={agentLoading}
          message={agentMsg}
          error={agentErr}
        />
      ) : (
        <ViewAgents
          key={refreshAgents}
          onEdit={(row) =>
            isGuest ? alert("Editing is disabled in Guest Mode") :
              setEditingAgent({
                id: row.deliveryagent_id || row.id,
                agentid: row.agentid,
                email: row.email,
                password: "",
              })
          }
          refresh={refreshAgents}
          isGuest={isGuest}
        />
      ),
    },
  ];

  // Icons
  const Icons = {
    Users: () => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    UserAdd: () => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    Truck: () => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    Logout: () => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    )
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-30 flex flex-col transition-transform duration-300 ease-in-out transform translate-x-0">
        <div className="flex items-center justify-center h-20 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600">
          <h1 className="text-2xl font-bold text-white tracking-wider">Admin Panel</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Management</p>
          {pages.map(({ key, label }) => {
            const isActive = page === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setEditingManager(null);
                  setEditingAgent(null);
                  setPage(key);
                }}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
              >
                <span className={`mr-3 transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`}>
                  {key.includes('Add') ? <Icons.UserAdd /> : <Icons.Users />}
                </span>
                {label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors duration-200"
          >
            <Icons.Logout />
            <span className="ml-3">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {pages.find((p) => p.key === page)?.label}
            </h2>
            <p className="text-gray-500 mt-1">Manage your application users and agents</p>
          </div>
          <div className="flex items-center gap-4">
            {isGuest && (
              <span className="px-4 py-1.5 bg-yellow-100 text-yellow-800 text-sm font-bold rounded-full border border-yellow-200 shadow-sm animate-pulse">
                Guest Mode
              </span>
            )}
            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border-2 border-indigo-200">
              A
            </div>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
          {pages.find((p) => p.key === page)?.component}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
