import { useEffect, useState } from "react";
import { getTasks, createTask, deleteTask } from "../api";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const token = localStorage.getItem("token");

  const loadTasks = async () => {
    const data = await getTasks(token);
    setTasks(data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async () => {
    await createTask(token, { title, description: "task" });
    setTitle("");
    loadTasks();
  };

  return (
    <div className="container">
      <div className="card">
        <h2>My Tasks</h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <button onClick={addTask}>Add Task</button>

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
            {t.title}
            <button onClick={() => deleteTask(token, t.id)}>X</button>
          </div>
        ))}
      </div>
    </div>
  );
}