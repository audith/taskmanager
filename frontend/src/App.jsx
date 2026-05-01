import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import { useState, useEffect } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    
    console.log("Checking auth, token exists:", !!token);
    
    if (!token) {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    
    try {
      // Decode token to check if it's valid
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp > currentTime) {
        setIsAuthenticated(true);
        setIsAdmin(payload.is_admin === true);
        console.log("User is authenticated, isAdmin:", payload.is_admin);
      } else {
        // Token expired
        localStorage.removeItem("token");
        localStorage.removeItem("is_admin");
        localStorage.removeItem("user_email");
        setIsAuthenticated(false);
        setIsAdmin(false);
        console.log("Token expired");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("is_admin");
      localStorage.removeItem("user_email");
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - only accessible when NOT logged in */}
        <Route 
          path="/" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} 
        />
        
        {/* Protected routes - only accessible when logged in */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              !isAdmin ? <Dashboard /> : <Navigate to="/admin" />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        <Route 
          path="/admin" 
          element={
            isAuthenticated && isAdmin ? <AdminPanel /> : <Navigate to="/" />
          } 
        />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;