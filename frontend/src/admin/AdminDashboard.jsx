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
const ManagerForm = ({editing,formData,setFormData,onSubmit,onCancel,isLoading,message,error,}) => (
  <form
    onSubmit={onSubmit}
    className="bg-white rounded-xl shadow-lg p-6 mb-8 space-y-4 max-w-3xl mx-auto"
  >
    <h2 className="text-xl font-semibold mb-4">
      {editing ? "Edit Manager" : "Add Manager"}
    </h2>
    <Input
      label="Manager ID"
      name="manager_id"
      value={formData.manager_id}
      onChange={(e) =>
        setFormData((f) => ({ ...f, manager_id: e.target.value }))
      }
      placeholder="Enter manager ID"
    />
    <Input
      label="Name"
      name="name"
      value={formData.name}
      onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
      placeholder="Enter name"
    />
    <Input
      label="Email"
      type="email"
      name="email"
      value={formData.email}
      onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
      placeholder="Enter email"
    />
    <Input
      label="Password"
      type="password"
      name="password"
      value={formData.password}
      onChange={(e) =>
        setFormData((f) => ({ ...f, password: e.target.value }))
      }
      placeholder={editing ? "Leave blank to keep current password" : "Enter password"}
    />
    <Input
      label="Phone"
      name="phone"
      value={formData.phone}
      onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
      placeholder="Enter phone"
    />
    <div className="flex justify-center gap-3">
      <button
        type="submit"
        disabled={isLoading}
        className="w-48 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold"
      >
        {isLoading ? (editing ? "Updating..." : "Creating...") : editing ? "Update" : "Create Manager"}
      </button>
      {editing && (
        <button
          type="button"
          onClick={onCancel}
          className="w-24 bg-gray-400 hover:bg-gray-500 text-white font-semibold px-6 py-2 rounded-lg"
        >
          Cancel
        </button>
      )}
    </div>
    {message && <div className="text-green-700 mt-2 text-center">{message}</div>}
    {error && <div className="text-red-700 mt-2 text-center">{error}</div>}
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
    className="bg-white rounded-xl shadow-lg p-6 mb-8 space-y-4 max-w-3xl mx-auto"
  >
    <h2 className="text-xl font-semibold mb-4">
      {editing ? "Edit Delivery Agent" : "Add Delivery Agent"}
    </h2>
    <Input
      label="Agent ID"
      name="agentid"
      value={formData.agentid}
      onChange={(e) =>
        setFormData((f) => ({ ...f, agentid: e.target.value }))
      }
      placeholder="Enter agent ID"
    />
    <Input
      label="Email"
      type="email"
      name="email"
      value={formData.email}
      onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
      placeholder="Enter email"
    />
    <Input
      label="Password"
      type="password"
      name="password"
      value={formData.password}
      onChange={(e) =>
        setFormData((f) => ({ ...f, password: e.target.value }))
      }
      placeholder={editing ? "Leave blank to keep current password" : "Enter password"}
    />
    <div className="flex justify-center gap-3">
      <button
        type="submit"
        disabled={isLoading}
        className="w-48 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold"
      >
        {isLoading ? (editing ? "Updating..." : "Creating...") : editing ? "Update" : "Create Delivery Agent"}
      </button>
      {editing && (
        <button
          type="button"
          onClick={onCancel}
          className="w-24 bg-gray-400 hover:bg-gray-500 text-white font-semibold px-6 py-2 rounded-lg"
        >
          Cancel
        </button>
      )}
    </div>
    {message && <div className="text-green-700 mt-2 text-center">{message}</div>}
    {error && <div className="text-red-700 mt-2 text-center">{error}</div>}
  </form>
);

// ViewManagers Component
const ViewManagers = ({ onEdit, refresh }) => {
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const API_BASE_URL = "http://localhost:3000/managers";
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
    if (!window.confirm("Are you sure you want to delete this manager?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/${managerId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setManagers((prev) => prev.filter((m) => m.id !== managerId));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Managers</h2>
        <button
          onClick={fetchManagers}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
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
            {managers.map((manager) => (
              <tr key={manager.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-800">{manager.manager_id || "N/A"}</td>
                <td className="py-3 px-4">{manager.name || "N/A"}</td>
                <td className="py-3 px-4">{manager.email || "N/A"}</td>
                <td className="py-3 px-4">{manager.phone || "N/A"}</td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {manager.created_at ? new Date(manager.created_at).toLocaleDateString() : "N/A"}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                      onClick={() => onEdit(manager)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                      onClick={() => handleDelete(manager.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && <div className="text-red-700 mt-2">{error}</div>}
      </div>
    </div>
  );
};

// ViewAgents Component
const ViewAgents = ({ onEdit, refresh }) => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const API_BASE_URL = "http://localhost:3000/delivery-agent";

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
    if (!window.confirm("Are you sure you want to delete this delivery agent?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/${agentId}`);
      setAgents((prev) => prev.filter((a) => (a.deliveryagent_id || a.id) !== agentId));
    } catch (err) {
      alert("Delete failed.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Delivery Agents</h2>
        <button
          onClick={fetchAgents}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
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
            {agents.map((agent) => {
              const agentId = agent.deliveryagent_id || agent.id;
              return (
                <tr key={agentId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{agent.agentid || "N/A"}</td>
                  <td className="py-3 px-4">{agent.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {agent.created_at ? new Date(agent.created_at).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                        onClick={() => onEdit(agent)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                        onClick={() => handleDelete(agentId)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {error && <div className="text-red-700 mt-2">{error}</div>}
      </div>
    </div>
  );
};

// AdminDashboard Component
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState("addManager");

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
    const adminToken = localStorage.getItem("adminToken");
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
        "http://localhost:3000/managers/signup",
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
      setManagerErr(`❌ ${err.response?.data?.message || err.message}`);
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
        `http://localhost:3000/managers/${editingManager.id}`,
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
      setManagerErr(`❌ ${err.response?.data?.message || err.message}`);
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
      await axios.post("http://localhost:3000/delivery-agent/signup", agentAddForm);
      setAgentAddForm({ agentid: "", email: "", password: "" });
      setAgentMsg("🎉 Delivery agent created!");
      setRefreshAgents((v) => !v);
      setTimeout(() => setAgentMsg(""), 3000);
    } catch (err) {
      setAgentErr(`❌ ${err.response?.data?.message || err.message}`);
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
        `http://localhost:3000/delivery-agent/${editingAgent.id}`,
        updateData
      );
      setEditingAgent(null);
      setRefreshAgents((v) => !v);
      setAgentMsg("Delivery agent updated!");
      setTimeout(() => setAgentMsg(""), 3000);
    } catch (err) {
      setAgentErr(`❌ ${err.response?.data?.message || err.message}`);
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
        <ManagerForm
          editing={false}
          formData={managerAddForm}
          setFormData={setManagerAddForm}
          onSubmit={handleManagerAddSubmit}
          isLoading={managerLoading}
          message={managerMsg}
          error={managerErr}
        />
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
        <AgentForm
          editing={false}
          formData={agentAddForm}
          setFormData={setAgentAddForm}
          onSubmit={handleAgentAddSubmit}
          isLoading={agentLoading}
          message={agentMsg}
          error={agentErr}
        />
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
            setEditingAgent({
              id: row.deliveryagent_id || row.id,
              agentid: row.agentid,
              email: row.email,
              password: "",
            })
          }
          refresh={refreshAgents}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white">
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-row w-full justify-between items-center py-4">
            <div className="flex gap-4">
              {pages.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    setEditingManager(null);
                    setEditingAgent(null);
                    setPage(key);
                  }}
                  className={`px-6 py-2 rounded-lg font-semibold transition duration-300 ${
                    page === key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div>
              <button
                onClick={handleLogout}
                className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {pages.find((p) => p.key === page)?.component}
      </main>
    </div>
  );
};

export default AdminDashboard;
