import { useEffect, useState } from "react";
import { getTasks, deleteTask, createTask } from "../api";

export default function AdminPanel() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [ownerId, setOwnerId] = useState("");

  const token = localStorage.getItem("token");

  const loadTasks = async () => {
    const data = await getTasks(token);
    setTasks(data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async () => {
    await createTask(token, {
      title,
      description: "admin",
      owner_id: Number(ownerId),
    });
    loadTasks();
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Admin Panel</h2>

        <input placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="User ID" onChange={(e) => setOwnerId(e.target.value)} />

        <button onClick={addTask}>Assign Task</button>

        <button
          style={{ background: "red", marginTop: "10px" }}
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>

        {tasks.map((t) => (
          <div className="task" key={t.id}>
            {t.title} (User {t.owner_id})
            <button onClick={() => deleteTask(token, t.id)}>X</button>
          </div>
        ))}
      </div>
    </div>
  );
}