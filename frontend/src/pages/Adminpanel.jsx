import { useEffect, useState } from "react";
import { getTasks, deleteTask, createTask, getUsers, getUserTasks } from "../api";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const [allTasks, setAllTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewMode, setViewMode] = useState("all");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    const isAdmin = localStorage.getItem("is_admin");
    if (!isAdmin || isAdmin !== "true") {
      navigate("/dashboard");
      return;
    }
    await loadAllTasks();
    await loadUsers();
  };

  const loadAllTasks = async () => {
    try {
      const data = await getTasks(token);
      setAllTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load tasks");
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getUsers(token);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load users");
    }
  };

  const loadUserTasks = async (userId) => {
    try {
      setLoading(true);
      const data = await getUserTasks(token, userId);
      setUserTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load user tasks");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    localStorage.removeItem("user_email");
    navigate("/");
  };

  const addTaskForUser = async () => {
    if (!title.trim()) {
      setError("Please enter a task title");
      return;
    }
    
    try {
      setError("");
      setSuccess("Creating task...");
      
      await createTask(token, {
        title: title.trim(),
        description: description.trim(),
        owner_id: selectedUserId ? Number(selectedUserId) : null,
      });
      
      setTitle("");
      setDescription("");
      setSelectedUserId("");
      setSuccess("Task created successfully!");
      setTimeout(() => setSuccess(""), 2000);
      
      await loadAllTasks();
      if (selectedUser) {
        await loadUserTasks(selectedUser.id);
      }
    } catch (err) {
      setError(err.message || "Failed to create task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(token, taskId);
        setSuccess("Task deleted successfully!");
        setTimeout(() => setSuccess(""), 2000);
        await loadAllTasks();
        if (selectedUser) {
          await loadUserTasks(selectedUser.id);
        }
      } catch (err) {
        setError("Failed to delete task");
      }
    }
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setViewMode("user");
    await loadUserTasks(user.id);
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.email : `User ${userId}`;
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "900px", width: "100%" }}>
        <div className="admin-header">
          <h2>👑 Admin Dashboard</h2>
          <div>
            <span style={{ marginRight: "10px", fontSize: "14px", color: "#666" }}>
              👤 {localStorage.getItem("user_email")}
            </span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>

        {error && <div className="error" style={{ marginBottom: "10px" }}>❌ {error}</div>}
        {success && <div className="success" style={{ marginBottom: "10px" }}>✅ {success}</div>}

        {/* Create Task Section */}
        <div style={{ marginTop: "20px", padding: "20px", background: "#f7fafc", borderRadius: "8px" }}>
          <h3>📝 Create Task for Any User</h3>
          <input
            placeholder="Task title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="2"
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <select 
            value={selectedUserId} 
            onChange={(e) => setSelectedUserId(e.target.value)}
            style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
          >
            <option value="">-- Select user (or leave empty for yourself) --</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.email} {u.is_admin ? "(Admin)" : ""}
              </option>
            ))}
          </select>
          <button onClick={addTaskForUser} style={{ width: "100%" }}>➕ Create Task</button>
        </div>

        {/* Users List */}
        <div style={{ marginTop: "30px" }}>
          <h3>👥 All Users ({users.length})</h3>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {users.map(u => (
              <div 
                key={u.id} 
                onClick={() => handleUserSelect(u)}
                style={{
                  padding: "10px",
                  margin: "5px 0",
                  background: selectedUser?.id === u.id ? "#c3dafe" : "#edf2f7",
                  borderRadius: "5px",
                  cursor: "pointer",
                  transition: "background 0.3s"
                }}
              >
                <strong>{u.email}</strong>
                {u.is_admin && <span style={{ marginLeft: "10px", color: "#e53e3e" }}>👑 Admin</span>}
                <div style={{ fontSize: "12px", color: "#718096" }}>
                  User ID: {u.id}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Tasks Section */}
        {selectedUser && (
          <div style={{ marginTop: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>📋 Tasks for {selectedUser.email}</h3>
              <button 
                onClick={() => {
                  setSelectedUser(null);
                  setViewMode("all");
                }}
                style={{ width: "auto", padding: "5px 15px" }}
              >
                Back to All Tasks
              </button>
            </div>
            
            {loading ? (
              <p>Loading tasks...</p>
            ) : userTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#718096", background: "#f7fafc", borderRadius: "8px" }}>
                No tasks for this user yet
              </div>
            ) : (
              userTasks.map(task => (
                <div key={task.id} className="task" style={{ padding: "15px", marginTop: "10px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="task-title" style={{ fontWeight: "bold" }}>{task.title}</div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="delete-btn"
                      style={{ padding: "5px 15px", backgroundColor: "#f56565", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                  {task.description && <div className="task-description" style={{ marginTop: "8px", color: "#4a5568" }}>{task.description}</div>}
                  <div className="task-meta" style={{ marginTop: "8px", fontSize: "12px", color: "#a0aec0" }}>
                    Status: {task.completed ? "✅ Completed" : "⏳ Pending"}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* All Tasks Section */}
        {viewMode === "all" && !selectedUser && (
          <div style={{ marginTop: "30px" }}>
            <h3>📊 All Tasks in System ({allTasks.length})</h3>
            {allTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#718096", background: "#f7fafc", borderRadius: "8px" }}>
                No tasks in the system yet
              </div>
            ) : (
              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                {allTasks.map(task => (
                  <div key={task.id} className="task" style={{ padding: "15px", marginTop: "10px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div className="task-title" style={{ fontWeight: "bold" }}>{task.title}</div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="delete-btn"
                        style={{ padding: "5px 15px", backgroundColor: "#f56565", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                    {task.description && <div className="task-description" style={{ marginTop: "8px", color: "#4a5568" }}>{task.description}</div>}
                    <div className="task-meta" style={{ marginTop: "8px", fontSize: "12px", color: "#a0aec0" }}>
                      👤 Owner: {getUserName(task.owner_id)} | 📌 Status: {task.completed ? "Completed ✓" : "Pending ⏳"} | 🆔 ID: {task.id}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}