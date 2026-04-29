import { useEffect, useState } from "react";
import { getTasks, deleteTask, createTask, getUsers, getUserTasks } from "../api";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    loadAllTasks();
    loadUsers();
  }, []);

  const loadAllTasks = async () => {
    try {
      const data = await getTasks(token);
      setTasks(data);
    } catch (err) {
      setError("Failed to load tasks");
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getUsers(token);
      setUsers(data);
    } catch (err) {
      setError("Failed to load users");
    }
  };

  const loadUserTasks = async (userId) => {
    try {
      setLoading(true);
      const data = await getUserTasks(token, userId);
      setUserTasks(data);
    } catch (err) {
      setError("Failed to load user tasks");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const addTask = async () => {
    if (!title.trim()) return;
    
    try {
      await createTask(token, {
        title,
        description,
        owner_id: selectedUserId ? Number(selectedUserId) : null,
      });
      setTitle("");
      setDescription("");
      setSelectedUserId("");
      await loadAllTasks();
      if (selectedUser) {
        await loadUserTasks(selectedUser.id);
      }
    } catch (err) {
      setError("Failed to create task");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(token, id);
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
    await loadUserTasks(user.id);
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "800px" }}>
        <div className="admin-header">
          <h2>Admin Dashboard</h2>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>

        {error && <div className="error">{error}</div>}

        <div>
          <h3>Create Task for User</h3>
          <input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
          <select 
            value={selectedUserId} 
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Select user (or leave empty for yourself)</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.email} {u.is_admin ? "(Admin)" : ""}</option>
            ))}
          </select>
          <button onClick={addTask}>Create Task</button>
        </div>

        <div className="user-list">
          <h3>Users</h3>
          {users.map(u => (
            <div 
              key={u.id} 
              className={`user-item ${selectedUser?.id === u.id ? "selected" : ""}`}
              onClick={() => handleUserSelect(u)}
            >
              <strong>{u.email}</strong> {u.is_admin && <span>(Admin)</span>}
              <div style={{ fontSize: "12px", color: "#718096" }}>
                User ID: {u.id}
              </div>
            </div>
          ))}
        </div>

        {selectedUser && (
          <div>
            <h3>Tasks for {selectedUser.email}</h3>
            {loading ? (
              <p>Loading tasks...</p>
            ) : userTasks.length === 0 ? (
              <p>No tasks for this user</p>
            ) : (
              userTasks.map(task => (
                <div key={task.id} className="task">
                  <div className="task-header">
                    <div className="task-title">{task.title}</div>
                    <div className="task-actions">
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {task.description && (
                    <div className="task-description">{task.description}</div>
                  )}
                  <div className="task-meta">
                    Status: {task.completed ? "Completed" : "Pending"}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div>
          <h3>All Tasks</h3>
          {tasks.length === 0 ? (
            <p>No tasks in system</p>
          ) : (
            tasks.map(task => {
              const owner = users.find(u => u.id === task.owner_id);
              return (
                <div key={task.id} className="task">
                  <div className="task-header">
                    <div className="task-title">{task.title}</div>
                    <div className="task-actions">
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {task.description && (
                    <div className="task-description">{task.description}</div>
                  )}
                  <div className="task-meta">
                    Owner: {owner?.email || `User ${task.owner_id}`} | 
                    Status: {task.completed ? "Completed" : "Pending"}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}