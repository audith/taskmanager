import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";

function App() {
  const token = localStorage.getItem("token");
  
  // Function to check if token is valid
  const isValidToken = () => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // Check if token is expired
      const exp = payload.exp * 1000;
      return Date.now() < exp;
    } catch {
      return false;
    }
  };

  const isAuthenticated = isValidToken();
  
  // Function to get user role from token
  const getUserRole = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.is_admin ? "admin" : "user";
    } catch {
      return null;
    }
  };

  const userRole = getUserRole();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              userRole === "admin" ? <Navigate to="/admin" /> : <Dashboard />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        <Route 
          path="/admin" 
          element={
            isAuthenticated && userRole === "admin" ? (
              <AdminPanel />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;