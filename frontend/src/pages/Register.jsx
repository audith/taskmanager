import { useState } from "react";
import { register } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      setError("");
      setSuccess("");
      
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      
      const data = await register(email, password);
      
      if (data.id) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError("Registration failed");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Register</h2>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button onClick={handleRegister}>Register</button>

        <div className="nav-links">
          <Link to="/">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
}