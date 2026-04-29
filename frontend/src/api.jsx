const API = "http://127.0.0.1:8000";

export const login = async (email, password) => {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
};

export const register = async (email, password) => {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
};

export const getTasks = async (token) => {
  const res = await fetch(`${API}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.json();
};

export const createTask = async (token, task) => {
  const res = await fetch(`${API}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(task),
  });

  return res.json();
};

export const deleteTask = async (token, id) => {
  await fetch(`${API}/tasks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};