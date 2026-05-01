import { useEffect, useState } from "react";
import { getTasks, createTask, deleteTask, updateTask } from "../api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Loading tasks...");
      const data = await getTasks(token);
      console.log("Tasks loaded:", data);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading tasks:", err);
      setError(err.message || "Failed to load tasks");
      if (err.message.includes("Session expired")) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    localStorage.removeItem("user_email");
    navigate("/");
  };

  const addTask = async () => {
    if (!title.trim()) {
      setError("Please enter a task title");
      return;
    }
    
    try {
      setError("");
      setSuccess("Adding task...");
      await createTask(token, {
        title: title.trim(),
        description: description.trim(),
      });
      setTitle("");
      setDescription("");
      setSuccess("Task added successfully!");
      setTimeout(() => setSuccess(""), 2000);
      await loadTasks();
    } catch (err) {
      console.error("Error adding task:", err);
      setError(err.message || "Failed to add task");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        setError("");
        await deleteTask(token, id);
        setSuccess("Task deleted successfully!");
        setTimeout(() => setSuccess(""), 2000);
        await loadTasks();
      } catch (err) {
        console.error("Error deleting task:", err);
        setError(err.message || "Failed to delete task");
      }
    }
  };

  const toggleComplete = async (task) => {
    try {
      setError("");
      await updateTask(token, task.id, { completed: !task.completed });
      setSuccess("Task updated!");
      setTimeout(() => setSuccess(""), 1000);
      await loadTasks();
    } catch (err) {
      console.error("Error updating task:", err);
      setError(err.message || "Failed to update task");
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <div className="admin-header">
            <h2>📋 My Dashboard</h2>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
          <p style={{ textAlign: "center", padding: "20px" }}>Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "700px", width: "100%" }}>
        <div className="admin-header">
          <h2>📋 My Dashboard</h2>
          <div>
            <span style={{ marginRight: "10px", fontSize: "14px", color: "#666" }}>
              👤 {localStorage.getItem("user_email")}
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="error" style={{ marginBottom: "10px", padding: "10px", borderRadius: "5px" }}>
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div className="success" style={{ marginBottom: "10px", padding: "10px", borderRadius: "5px" }}>
            ✅ {success}
          </div>
        )}

        {/* Add Task Section */}
        <div style={{ marginTop: "20px", padding: "20px", background: "#f7fafc", borderRadius: "8px" }}>
          <h3 style={{ marginBottom: "15px" }}>➕ Add New Task</h3>
          <input
            type="text"
            placeholder="Task title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />
          <button onClick={addTask} style={{ width: "100%", padding: "10px" }}>
            Create Task
          </button>
        </div>

        {/* Tasks List Section */}
        <div style={{ marginTop: "30px" }}>
          <h3>📝 My Tasks ({tasks.length})</h3>
          {tasks.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "40px", 
              color: "#718096",
              background: "#f7fafc",
              borderRadius: "8px",
              marginTop: "10px"
            }}>
              ✨ No tasks yet. Create your first task above! ✨
            </div>
          ) : (
            tasks.map((task) => (
              <div 
                key={task.id} 
                className="task" 
                style={{ 
                  opacity: task.completed ? 0.7 : 1,
                  backgroundColor: task.completed ? "#f0f0f0" : "white",
                  padding: "15px",
                  marginTop: "10px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0"
                }}
              >
                <div className="task-content" style={{ display: "flex", alignItems: "flex-start" }}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task)}
                    style={{ marginRight: "15px", marginTop: "3px" }}
                  />
                  <div className="task-info" style={{ flex: 1 }}>
                    <div className="task-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div 
                        className="task-title"
                        style={{ 
                          textDecoration: task.completed ? "line-through" : "none",
                          color: task.completed ? "#a0aec0" : "#2d3748",
                          fontWeight: "bold",
                          fontSize: "16px"
                        }}
                      >
                        {task.title}
                      </div>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="delete-btn"
                        style={{ 
                          padding: "5px 15px", 
                          fontSize: "12px",
                          backgroundColor: "#f56565",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer"
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                    {task.description && (
                      <div className="task-description" style={{ marginTop: "8px", fontSize: "14px", color: "#4a5568" }}>
                        {task.description}
                      </div>
                    )}
                    <div className="task-meta" style={{ marginTop: "8px", fontSize: "12px", color: "#a0aec0" }}>
                      Task ID: {task.id} • Status: {task.completed ? "✅ Completed" : "⏳ Pending"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}