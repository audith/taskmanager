const API = "http://127.0.0.1:8000";

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Something went wrong");
  }
  return response.json();
};

export const login = async (email, password) => {
  const response = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const register = async (email, password) => {
  const response = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const getTasks = async (token) => {
  const response = await fetch(`${API}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const getUsers = async (token) => {
  const response = await fetch(`${API}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const createTask = async (token, task) => {
  const response = await fetch(`${API}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(task),
  });
  return handleResponse(response);
};

export const deleteTask = async (token, id) => {
  const response = await fetch(`${API}/tasks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const updateTask = async (token, id, updates) => {
  const params = new URLSearchParams(updates).toString();
  const response = await fetch(`${API}/tasks/${id}?${params}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const getUserTasks = async (token, userId) => {
  const response = await fetch(`${API}/users/${userId}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(response);
};