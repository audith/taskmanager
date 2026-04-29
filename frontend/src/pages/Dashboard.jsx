import { useEffect, useState } from "react";
import { getTasks, createTask, deleteTask, updateTask } from "../api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks(token);
      setTasks(data);
      setError("");
    } catch (err) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

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
      });
      setTitle("");
      setDescription("");
      await loadTasks();
    } catch (err) {
      setError("Failed to add task");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(token, id);
        await loadTasks();
      } catch (err) {
        setError("Failed to delete task");
      }
    }
  };

  const toggleComplete = async (task) => {
    try {
      await updateTask(token, task.id, { completed: !task.completed });
      await loadTasks();
    } catch (err) {
      setError("Failed to update task");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="admin-header">
          <h2>My Dashboard</h2>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>

        {error && <div className="error">{error}</div>}

        <div>
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
          <button onClick={addTask}>Add Task</button>
        </div>

        {loading ? (
          <p>Loading tasks...</p>
        ) : (
          <div>
            <h3>My Tasks ({tasks.length})</h3>
            {tasks.length === 0 ? (
              <p>No tasks yet. Create your first task above!</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className={`task ${task.completed ? "completed-task" : ""}`}>
                  <div className="task-content">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleComplete(task)}
                      className="completed-checkbox"
                    />
                    <div className="task-info">
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
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}