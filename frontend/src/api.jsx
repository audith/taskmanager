const API = "http://127.0.0.1:8000";

const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('is_admin');
      localStorage.removeItem('user_email');
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const login = async (email, password) => {
  const response = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(response);
  
  // Store user info in localStorage
  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('is_admin', data.user.is_admin);
    localStorage.setItem('user_email', data.user.email);
  }
  
  return data;
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
  if (!token) throw new Error('No token provided');
  const response = await fetch(`${API}/tasks`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
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